import math
from city_data import CITY_CONFIG

def calculate_pension(city_name, current_age, retire_age, current_balance, accumulated_years, monthly_salary, wage_growth=0):
    """
    核心计算函数
    :param city_name: 城市 (e.g., "北京")
    :param current_age: 当前年龄
    :param retire_age: 计划退休年龄
    :param current_balance: 当前个人账户余额
    :param accumulated_years: 已缴费年限
    :param monthly_salary: 当前税前工资
    :param wage_growth: 工资年增长率 (e.g. 0.03 代表 3%)
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

    # 3. 计算平均缴费指数
    # 指数 = 你的工资 / 社平工资。范围 0.6 ~ 3.0
    raw_index = monthly_salary / base_salary
    avg_index = max(0.6, min(3.0, raw_index))

    # ---------------------------------------------------------
    # 第一部分：基础养老金 (Basic Pension)
    # 公式：基数 * (1 + 指数) / 2 * 年限 * 1%
    # ---------------------------------------------------------
    pension_basic = base_salary * (1 + avg_index) / 2 * total_years * 0.01

    # ---------------------------------------------------------
    # 第二部分：个人账户养老金 (Account Pension)
    # 逻辑：循环计算未来每年的缴费，支持复利增长
    # ---------------------------------------------------------
    future_contribution = 0
    current_salary_for_calc = monthly_salary

    for year in range(years_to_work):
        # 限制当年的缴费基数 (不能超过上限，不能低于下限)
        capped_salary = max(city_info["min_salary"], min(city_info["max_salary"], current_salary_for_calc))

        # 计算这一年的个人账户存入额 (基数 * 8% * 12个月)
        yearly_contribution = capped_salary * 0.08 * 12
        future_contribution += yearly_contribution

        # 计算下一年的工资 (复利增长)
        current_salary_for_calc *= (1 + wage_growth)

    # 退休时的账户总额
    final_balance = current_balance + future_contribution

    # 计发月数 (国家标准，仅与退休年龄有关)
    # 50岁->195个月, 55岁->170个月, 60岁及以上->139个月
    dividing_months = 139
    if retire_age <= 50:
        dividing_months = 195
    elif retire_age <= 55:
        dividing_months = 170
    elif retire_age >= 60:
        dividing_months = 139

    pension_account = final_balance / dividing_months

    # ---------------------------------------------------------
    # 汇总结果
    # ---------------------------------------------------------
    total_pension = pension_basic + pension_account

    return {
        "city": city_name,
        "detail": {
            "basic_pension": round(pension_basic, 2),
            "account_pension": round(pension_account, 2),
            "total_pension": round(total_pension, 2),
            "final_balance": round(final_balance, 2),
            "total_years": total_years,
            "avg_index": round(avg_index, 2)
        }
    }