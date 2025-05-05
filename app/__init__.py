from flask import Flask
from .routes.github_routes import github_bp
from .config.config import DEBUG
import os

def create_app():
    """Application factory function"""
    app = Flask(__name__, 
                static_folder='../static',
                template_folder='templates')
    
   
    app.register_blueprint(github_bp)
    
    
    app.config['DEBUG'] = DEBUG
    
    return app 