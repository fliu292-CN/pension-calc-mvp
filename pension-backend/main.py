import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pension_core import calculate_pension

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return "Pension Calculator Service is Running!"

@app.route('/api/calculate', methods=['POST'])
def calculate_api():
    """
    计算养老金接口
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # 1. 提取参数
        city = data.get("city", "北京")
        current_age = int(data.get("age", 30))
        retire_age = int(data.get("retire_age", 60))
        current_balance = float(data.get("balance", 0))
        accumulated_years = int(data.get("years", 0))
        monthly_salary = float(data.get("salary", 0))
        wage_growth = float(data.get("wage_growth", 0))

        # 2. 调用核心算法
        result = calculate_pension(
            city_name=city,
            current_age=current_age,
            retire_age=retire_age,
            current_balance=current_balance,
            accumulated_years=accumulated_years,
            monthly_salary=monthly_salary,
            wage_growth=wage_growth
        )

        if "error" in result:
            return jsonify(result), 400

        return jsonify({
            "code": 0,
            "msg": "success",
            "data": result
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 80))
    app.run(debug=True, host='0.0.0.0', port=port)