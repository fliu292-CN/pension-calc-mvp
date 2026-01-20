# city_data.py

CITY_CONFIG = {
    "北京": {
        "name": "Beijing",
        "base_salary": 11761,  # 2024年北京养老金计发基数
        "min_salary": 6326,    # 缴费下限 (基数的60%左右)
        "max_salary": 33891,   # 缴费上限 (基数的300%)
    },
    "上海": {
        "name": "Shanghai",
        "base_salary": 12307,  # 2024年上海养老金计发基数
        "min_salary": 7384,
        "max_salary": 36921,
    },
    "深圳": {
        "name": "Shenzhen",
        "base_salary": 10646,  # 2024年广东/深圳基数
        "min_salary": 5284,    # 深圳可能有特殊下限，暂按广东标准
        "max_salary": 31938,
    },
    "广州": {
        "name": "Guangzhou",
        "base_salary": 9120,   # 2024年广东省基数
        "min_salary": 5284,
        "max_salary": 26421,
    }
}