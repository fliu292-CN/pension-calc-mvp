# 文件路径: cloudfunctions/pension_calc/index.py
import sys
import json
from pension_core import calculate_pension

# 微信云函数的标准入口函数，必须叫 main_handler
def main_handler(event, context):
    """
    event: 包含了前端小程序发来的参数 (字典格式)
    context: 包含了环境信息 (如用户的 OpenID)
    """
    try:
        # 1. 从 event 中提取参数，并设置默认值防止报错
        # 注意：前端传来的全是字符串，需要按需转 int/float
        params = {
            "city_name": event.get("city", "北京"),
            "current_age": int(event.get("current_age", 30)),
            "retire_age": int(event.get("retire_age", 60)),
            "gender": event.get("gender", "male"),
            "current_balance": float(event.get("current_balance", 0)),
            "accumulated_years": int(event.get("accumulated_years", 0)),
            "monthly_salary": float(event.get("monthly_salary", 0))
        }

        # 2. 调用你的核心算法
        result = calculate_pension(**params)

        # 3. 返回结果给小程序
        return {
            "code": 0,
            "msg": "success",
            "data": result
        }

    except Exception as e:
        # 如果出错，返回错误信息
        return {
            "code": -1,
            "msg": f"计算出错: {str(e)}",
            "data": None
        }