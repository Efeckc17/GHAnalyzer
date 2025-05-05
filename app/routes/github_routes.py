from flask import Blueprint, render_template, request
from ..services.github_service import GitHubService

github_bp = Blueprint('github', __name__)
github_service = GitHubService()

@github_bp.route('/', methods=['GET', 'POST'])
def index():
    """Handle the main page and user analysis requests"""
    if request.method == 'POST':
        username = request.form.get('username')
        if username:
            stats, error = github_service.get_user_stats(username)
            return render_template('index.html', user_stats=stats, error=error)
    return render_template('index.html') 