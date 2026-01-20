# city_data.py
# 数据更新时间：2026年1月
# 数据来源：各地人社局 2025年度养老金计发基数与缴费基数通告

CITY_CONFIG = {
    "北京": {
        "name": "Beijing",
        # 2025年北京养老金计发基数
        "base_salary": 12049,
        # 缴费下限 (2025年度标准)
        "min_salary": 7162,
        # 缴费上限 (2025年度标准)
        "max_salary": 35811,
    },
    "上海": {
        "name": "Shanghai",
        # 2025年上海社保基数 (取自2024年全口径平均工资)
        "base_salary": 12434,
        # 缴费下限
        "min_salary": 7460,
        # 缴费上限
        "max_salary": 37302,
    },
    "深圳": {
        "name": "Shenzhen",
        # 2025年深圳企业职工基本养老金计发基数
        "base_salary": 11293,
        # 缴费下限 (深圳有特定标准，非简单的60%)
        "min_salary": 4775,
        # 缴费上限 (全省统一)
        "max_salary": 27549,
    },
    "广州": {
        "name": "Guangzhou",
        # 2025年广东省养老金计发基数 (广州执行省统一标准)
        "base_salary": 9493,
        # 缴费下限 (广州/省直下限)
        "min_salary": 5510,
        # 缴费上限 (全省统一)
        "max_salary": 27549,
    }
}