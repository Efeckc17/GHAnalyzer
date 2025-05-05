from github import Github
from collections import defaultdict
from datetime import datetime, timezone
import concurrent.futures
from functools import lru_cache
from ..config.config import GITHUB_TOKEN, MAX_WORKERS

class GitHubService:
    def __init__(self):
        self.github = Github(GITHUB_TOKEN)

    @lru_cache(maxsize=100)
    def fetch_repo_stats(self, repo):
        try:
            commits = repo.get_commits() if repo.permissions.pull else []
            commit_dates = defaultdict(int)
            
            for commit in commits:
                date = commit.commit.author.date
                quarter = f"{date.year} Q{(date.month-1)//3 + 1}"
                commit_dates[quarter] += 1

            return {
                'name': repo.name,
                'stars': repo.stargazers_count,
                'forks': repo.forks_count,
                'language': repo.language or 'Unknown',
                'created_at': repo.created_at,
                'updated_at': repo.updated_at,
                'description': repo.description,
                'size': repo.size,
                'commits': repo.get_commits().totalCount if repo.permissions.pull else 0,
                'commit_history': dict(commit_dates),
                'url': repo.html_url,
                'issues': repo.get_issues(state='all').totalCount,
                'pull_requests': repo.get_pulls(state='all').totalCount
            }
        except:
            return None

    def get_rate_limit(self):
        rate_limit = self.github.get_rate_limit()
        return {
            'core': {
                'remaining': rate_limit.core.remaining,
                'limit': rate_limit.core.limit,
                'reset_time': rate_limit.core.reset.strftime('%H:%M:%S')
            },
            'search': {
                'remaining': rate_limit.search.remaining,
                'limit': rate_limit.search.limit,
                'reset_time': rate_limit.search.reset.strftime('%H:%M:%S')
            }
        }

    def get_user_stats(self, username):
        try:
            user = self.github.get_user(username)
            repos = list(user.get_repos())
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
                repo_stats = list(filter(None, executor.map(self.fetch_repo_stats, repos)))
            
            stats = self._process_repo_stats(repo_stats, user)
            stats['rate_limit'] = self.get_rate_limit()
            
            return stats, None
        except Exception as e:
            return None, str(e)

    def _process_repo_stats(self, repo_stats, user):
        total_commit_history = defaultdict(int)
        for repo in repo_stats:
            for quarter, count in repo.get('commit_history', {}).items():
                total_commit_history[quarter] += count
        
        languages = defaultdict(int)
        for repo in repo_stats:
            languages[repo['language']] += 1
        
        total_stars = sum(repo['stars'] for repo in repo_stats)
        total_forks = sum(repo['forks'] for repo in repo_stats)
        total_issues = sum(repo['issues'] for repo in repo_stats)
        total_prs = sum(repo['pull_requests'] for repo in repo_stats)
        
        top_languages = dict(sorted(languages.items(), key=lambda x: x[1], reverse=True)[:5])
        top_repos = sorted(repo_stats, key=lambda x: x['stars'], reverse=True)[:5]
        
        now = datetime.now(timezone.utc)
        account_age = (now - user.created_at).days
        
        return {
            'user': {
                'name': user.name,
                'login': user.login,
                'bio': user.bio,
                'avatar_url': user.avatar_url,
                'location': user.location,
                'email': user.email,
                'company': user.company,
                'blog': user.blog,
                'created_at': user.created_at.isoformat(),
                'account_age_days': account_age,
                'account_age_years': round(account_age / 365, 1)
            },
            'stats': {
                'public_repos': user.public_repos,
                'total_stars': total_stars,
                'total_forks': total_forks,
                'total_issues': total_issues,
                'total_prs': total_prs,
                'followers': user.followers,
                'following': user.following,
                'contributions': sum(repo['commits'] for repo in repo_stats),
                'commit_history': dict(sorted(total_commit_history.items(), reverse=True))
            },
            'languages': {
                'distribution': dict(languages),
                'top_languages': top_languages,
                'total_languages': len(languages)
            },
            'repos': {
                'top_repos': [{
                    **repo,
                    'created_at': repo['created_at'].isoformat(),
                    'updated_at': repo['updated_at'].isoformat()
                } for repo in top_repos],
                'avg_stars_per_repo': round(total_stars / len(repo_stats) if repo_stats else 0, 1)
            }
        } 