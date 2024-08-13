import json
import numpy as np
import requests
import itertools
from bs4 import BeautifulSoup

def is_json_serializable(value):
    try:
        json.dumps(value)
        return True
    except (TypeError, OverflowError):
        return False

class PythonExecutionError(Exception):
    """
    Exception raised when Python code execution fails.

    Attributes:
        message -- explanation of the error
    """

    def __init__(self, message="Python code execution failed"):
        self.message = message
        super().__init__(self.message)

def execute_code(code):
    local_vars = {}
    try:
        exec(code, globals(), local_vars)
    except Exception as e:
        raise PythonExecutionError(e)
    return {k: v for k, v in local_vars.items() if is_json_serializable(v)}

def handler(event, context):
    code = event['code']

    print(f'Executing code: {json.dumps(code)}')

    serializable_vars = execute_code(code)
    return json.dumps(serializable_vars)