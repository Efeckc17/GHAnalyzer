import os
from dotenv import load_dotenv


load_dotenv()


GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')


DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
MAX_WORKERS = int(os.getenv('MAX_WORKERS', '10'))


CACHE_TIMEOUT = int(os.getenv('CACHE_TIMEOUT', '3600'))  
MAX_CACHE_ITEMS = int(os.getenv('MAX_CACHE_ITEMS', '100')) 