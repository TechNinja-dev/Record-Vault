# backend/config/db.py
import pymysql
from pymysql.cursors import DictCursor

connection = pymysql.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="RV@202628",
    database="record_vault",
    cursorclass=DictCursor,
    autocommit=True
)

cursor = connection.cursor()
