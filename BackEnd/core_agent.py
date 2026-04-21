from dotenv import load_dotenv
load_dotenv()

import os
import requests
from tavily import TavilyClient
from rich import print

from langchain_mistralai import ChatMistralAI
from langchain.tools import tool
from langchain_core.messages import ToolMessage
from langchain.agents import create_agent
from langchain.agents.middleware import wrap_tool_call



# ==============================
# 🔧 Initialize APIs
# ==============================
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
llm = ChatMistralAI(model="mistral-large-latest")




# ==============================
# 🌦️ Weather Tool
# ==============================
@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    try:
        api_key = os.getenv("OPENWEATHER_API_KEY")
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"

        res = requests.get(url, timeout=5)
        res.raise_for_status()
        data = res.json()

        return f"🌦️ {city}: {data['main']['temp']}°C, {data['weather'][0]['description']}"
    except requests.exceptions.RequestException as e:
        return f"⚠️ Weather API error: {str(e)}"


# ==============================
# 🏙️ City Info Tool (FIXED)
# ==============================
@tool
def get_city_info(city: str) -> str:
    """Get general info about a city."""
    try:
        res = tavily_client.search(
            query=f"{city} city overview population economy facts",
            num_results=2
        )
        results = res.get("results", [])

        if not results:
            return f"No info found for {city}"

        return f"🏙️ {city} Info:\n\n{results[0]['content']}"
    except Exception as e:
        return f"⚠️ City info error: {str(e)}"


# ==============================
# 📰 News Tool
# ==============================
@tool
def get_news(city: str) -> str:
    """Get latest news of a city."""
    try:
        res = tavily_client.search(
            query=f"latest news in {city}",
            num_results=3
        )
        results = res.get("results", [])

        if not results:
            return f"No news for {city}"

        return "\n\n".join(
            f"📰 {r['title']}\n{r['url']}" for r in results
        )
    except Exception as e:
        return f"⚠️ News error: {str(e)}"


# ==============================
# 🏖️ Places Tool
# ==============================
@tool
def get_places(city: str) -> str:
    """Get tourist places in a city."""
    try:
        res = tavily_client.search(
            query=f"top tourist places in {city}",
            num_results=5
        )
        results = res.get("results", [])

        return "\n\n".join(
            f"📍 {r['title']}\n{r['url']}" for r in results
        )
    except Exception as e:
        return f"⚠️ Places error: {str(e)}"


# ==============================
# 💰 Finance: Stock Price
# ==============================
@tool
def get_stock_price(symbol: str) -> str:
    """Get stock price."""
    try:
        url = f"https://query1.finance.yahoo.com/v7/finance/quote?symbols={symbol}"
        res = requests.get(url, timeout=5)
        data = res.json()

        stock = data["quoteResponse"]["result"][0]

        return f"📈 {symbol}: {stock['regularMarketPrice']} ({stock['regularMarketChangePercent']}%)"
    except Exception:
        return "⚠️ Stock data unavailable"


# ==============================
# 💱 Currency Converter
# ==============================
@tool
def convert_currency(amount: float, from_currency: str, to_currency: str) -> str:
    """Convert currency."""
    try:
        url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
        res = requests.get(url, timeout=5)
        data = res.json()

        rate = data["rates"][to_currency]
        return f"💱 {amount} {from_currency} = {amount * rate:.2f} {to_currency}"
    except Exception:
        return "⚠️ Conversion failed"


# ==============================
# 🧾 Middleware (Optional Confirm)
# ==============================
ENABLE_CONFIRM = False

@wrap_tool_call
def human_confirm(request, handler):
    if not ENABLE_CONFIRM:
        return handler(request)

    tool_name = request.tool_call["name"]
    confirm = input(f"Run tool '{tool_name}'? (yes/no): ")

    if confirm.lower() != "yes":
        return ToolMessage(
            content="Cancelled",
            tool_call_id=request.tool_call["id"]
        )
    return handler(request)


# ==============================
# 🧾 Logger Middleware
# ==============================
@wrap_tool_call
def logger(request, handler):
    print(f"[yellow]🔧 Tool:[/yellow] {request.tool_call['name']}")
    return handler(request)


# ==============================
# 🤖 Agent
# ==============================
agent = create_agent(
    llm,
    tools=[
        get_weather,
        get_city_info,
        get_news,
        get_places,
        get_stock_price,
        convert_currency
    ],
    
    middleware=[logger, human_confirm],
    system_prompt="""
You are a smart assistant for cities and finance.

Use tools:
- Weather → weather queries
- City info → facts
- News → current events
- Places → tourism
- Stock → market queries
- Currency → conversions

Rules:
- Use tools when relevant
- Be concise and clear
- Always provide accurate info. If unsure, ask for clarification instead of guessing.
- Use Bullet Point in the Answer
- Use Heading for the Answer
- Use Bold Font for highlighting something
- Use Itailic Font for highlighting something

Be accurate. Ask if unclear.
"""
)


# ✅ SAFE CLI
if __name__ == "__main__":
        # ==============================
    # 💬 Chat Loop (FIXED)
    # ==============================
    print("[bold green]🚀 AI Agent Started (type 'exit' to quit)[/bold green]")
    
    while True:
        user_input = input("\nYou: ")
    
        if user_input.lower() == "exit":
            print("👋 Goodbye!")
            break
        
        result = agent.invoke({
            "messages": [{"role": "user", "content": user_input}]
        })
    
        print(f"\n🤖 {result['messages'][-1].content}")

