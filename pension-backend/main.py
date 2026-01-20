import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pension_core import calculate_pension

app = Flask(__name__)
# 允许跨域，方便调试，云托管内部其实不太需要，但加上无妨
CORS(app)

@app.route('/')
def hello():
    """根路径检查，用于确认服务是否存活"""
    return "Pension Calculator Service is Running!"

@app.route('/api/calculate', methods=['POST'])
def calculate_api():
    """
    计算养老金接口
    接收 JSON 格式数据：
    {
        "city": "北京",
        "age": 30,
        "retire_age": 60,
        "gender": "male",
        "balance": 50000,
        "years": 5,
        "salary": 20000
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # 1. 提取参数 (设置默认值防止报错)
        city = data.get("city", "北京")
        current_age = int(data.get("age", 30))
        retire_age = int(data.get("retire_age", 60))
        gender = data.get("gender", "male")
        current_balance = float(data.get("balance", 0))
        accumulated_years = int(data.get("years", 0))
        monthly_salary = float(data.get("salary", 0))

        # 2. 调用核心算法 (你提供的 pension_core.py)
        result = calculate_pension(
            city_name=city,
            current_age=current_age,
            retire_age=retire_age,
            gender=gender,
            current_balance=current_balance,
            accumulated_years=accumulated_years,
            monthly_salary=monthly_salary
        )

        # 3. 检查是否有业务错误 (比如城市不支持)
        if "error" in result:
            return jsonify(result), 400

        # 4. 返回成功结果
        return jsonify({
            "code": 0,
            "msg": "success",
            "data": result
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

if __name__ == '__main__':
    # 微信云托管通常使用 80 端口
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)