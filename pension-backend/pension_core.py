import math
from city_data import CITY_CONFIG  # 导入上面的配置

def calculate_pension(city_name, current_age, retire_age, gender, current_balance, accumulated_years, monthly_salary):
    """
    核心计算函数
    :param city_name: 城市 (e.g., "北京")
    :param current_age: 当前年龄 (e.g., 30)
    :param retire_age: 计划退休年龄 (e.g., 60)
    :param gender: 性别 "male"/"female" (用于兜底退休年龄检查)
    :param current_balance: 当前个人账户余额 (e.g., 50000)
    :param accumulated_years: 已缴费年限 (e.g., 5)
    :param monthly_salary: 当前税前工资 (e.g., 20000)
    """
    
    # 1. 获取城市基数
    city_info = CITY_CONFIG.get(city_name)
    if not city_info:
        return {"error": "暂不支持该城市"}
        
    base_salary = city_info["base_salary"]
    
    # 2. 计算未来的变量
    years_to_work = retire_age - current_age
    if years_to_work < 0:
        years_to_work = 0
        
    total_years = accumulated_years + years_to_work
    
    # 3. 计算平均缴费指数 (Average Payment Index)
    # 指数 = 你的工资 / 社平工资。范围 0.6 ~ 3.0
    # 注意：这里我们假设用户未来一直保持这个工资水平（MVP简化逻辑）
    raw_index = monthly_salary / base_salary
    avg_index = max(0.6, min(3.0, raw_index)) # 限制在 0.6 到 3.0 之间
    
    # ---------------------------------------------------------
    # 第一部分：基础养老金
    # 公式：基数 * (1 + 指数) / 2 * 年限 * 1%
    # ---------------------------------------------------------
    pension_basic = base_salary * (1 + avg_index) / 2 * total_years * 0.01
    
    # ---------------------------------------------------------
    # 第二部分：个人账户养老金
    # 难点：预测退休时的账户余额
    # 估算逻辑：当前余额 + (月工资 * 8% * 剩余月数) (忽略利息)
    # ---------------------------------------------------------
    months_to_work = years_to_work * 12
    # 个人缴纳部分通常是工资的 8%
    # 注意：这里工资也应该受上下限限制，但MVP先简化
    contribution_base = max(city_info["min_salary"], min(city_info["max_salary"], monthly_salary))
    future_contribution = contribution_base * 0.08 * months_to_work
    
    final_balance = current_balance + future_contribution
    
    # 计发月数 (国家标准)
    dividing_months = 139 # 默认60岁
    if retire_age <= 50:
        dividing_months = 195
    elif retire_age <= 55:
        dividing_months = 170
    elif retire_age >= 60:
        dividing_months = 139
        
    pension_account = final_balance / dividing_months
    
    # ---------------------------------------------------------
    # 汇总
    # ---------------------------------------------------------
    total_pension = pension_basic + pension_account
    
    return {
        "city": city_name,
        "detail": {
            "basic_pension": round(pension_basic, 2), # 基础部分
            "account_pension": round(pension_account, 2), # 个人账户部分
            "total_pension": round(total_pension, 2),
            "final_balance": round(final_balance, 2), # 退休时账户有多少钱
            "total_years": total_years,
            "avg_index": round(avg_index, 2)
        }
    }

# --- 测试代码 ---
if __name__ == "__main__":
    # 模拟一个用户：北京，30岁，男，月薪2万，已交5年，账户里有5万，60岁退休
    result = calculate_pension(
        city_name="北京",
        current_age=30,
        retire_age=60,
        gender="male",
        current_balance=50000,
        accumulated_years=5,
        monthly_salary=20000
    )
    
    print("-" * 30)
    print(f"MVP 计算结果测试: {result['city']}")
    print(f"基础养老金: {result['detail']['basic_pension']}")
    print(f"账户养老金: {result['detail']['account_pension']}")
    print(f"预计月领: {result['detail']['total_pension']}")
    print("-" * 30)