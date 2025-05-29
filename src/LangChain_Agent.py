from langchain_ollama.llms import OllamaLLM as Ollama
from langchain.agents import initialize_agent
from langchain.tools import tool
import re

# 定義工具並使用 @tool 裝飾器
# 注意：ZeroShotAgent 不支持多參數工具，因此改為單參解析

@tool
def add_tool(expression: str) -> int:
    """Add two integers provided in the format 'a and b'."""
    # Extract all numbers from the expression
    nums = [int(s) for s in re.findall(r'\d+', expression)]
    if len(nums) != 2:
        raise ValueError("Please provide two numbers to add, e.g., '5 and 7'.")
    return nums[0] + nums[1]

@tool
def multiply_tool(expression: str) -> int:
    """Multiply two integers provided in the format 'a and b'."""
    # Extract all numbers from the expression
    nums = [int(s) for s in re.findall(r'\d+', expression)]
    if len(nums) != 2:
        raise ValueError("Please provide two numbers to multiply, e.g., '6 and 9'.")
    return nums[0] * nums[1]

@tool
def bmi_tool(expression: str) -> float:
    """Calculate BMI from weight in kg and height in meters. Format: '70 kg and 1.75 m'"""
    try:
        # Extract weight (handling both kg and g)
        weight_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:kg|g)?', expression)
        if not weight_match:
            raise ValueError("Weight not found")
        weight = float(weight_match.group(1))
        
        # Convert grams to kg if needed
        if 'g' in expression.lower():
            weight = weight / 1000
            
        # Extract height
        height_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:m|meters|公尺)?', expression)
        if not height_match:
            raise ValueError("Height not found")
        height = float(height_match.group(1))
        
        if height <= 0:
            raise ValueError("Height must be greater than zero.")
            
        return weight / (height ** 2)
    except Exception as e:
        raise ValueError(f"Please provide weight and height in format: '70 kg and 1.75 m'. Error: {str(e)}")

# 初始化本地 Ollama LLM (需安裝 langchain-community)
llm = Ollama(
    model="llama3",
    base_url="http://localhost:11434",
    verbose=True
)

# 使用單參工具列表
tools = [add_tool, multiply_tool, bmi_tool]

# 初始化 agent (zero-shot-react-description)，支持單參工具調用
tag = initialize_agent(
    tools=tools,
    llm=llm,
    agent="zero-shot-react-description",
    verbose=True
)


# 測試示例
if __name__ == "__main__":
    queries = [
        "Please add two number with 1, 3",
        "Please compute 3 multiply 4",
        "Calculate BMI for 70 kg and 1.75 m",
        "請計算 BMI，身高是 1.73 公尺, 體重是 85000 g"
    ]
    for q in queries:
        print(f"\nQuery: {q}")
        try:
            result = tag.invoke(q)
            print("Response:", result)
        except Exception as e:
            print(f"Error: {e}")
        print("-" * 40)