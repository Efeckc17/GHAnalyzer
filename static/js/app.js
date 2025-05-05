let githubData = {};


document.addEventListener('DOMContentLoaded', function() {
    const dataElement = document.getElementById('github-data');
    if (!dataElement) return;

    try {
        const userData = JSON.parse(dataElement.textContent);
        initializeCharts(userData);
    } catch (error) {
        console.error('Error parsing user data:', error);
    }
});


function initializeCharts(data) {
    
    console.log('Language data:', {
        repos: data.languages.by_repos,
        stars: data.languages.by_stars,
        commits: data.languages.by_commits
    });

    
    if (data.languages) {
        if (data.languages.by_repos) {
            createLanguageChart('reposPerLanguage', 'reposPerLanguageLegend', data.languages.by_repos);
        }
        if (data.languages.by_stars) {
            createLanguageChart('starsPerLanguage', 'starsPerLanguageLegend', data.languages.by_stars);
        }
        if (data.languages.by_commits) {
            createLanguageChart('commitsPerLanguage', 'commitsPerLanguageLegend', data.languages.by_commits);
        }
    }

    
    const commitHistory = data.stats.commit_history;
    if (commitHistory) {
        createCommitsTimeline({
            labels: Object.keys(commitHistory),
            values: Object.values(commitHistory)
        });
    }

    
    if (data.repos && data.repos.top_repos) {
        const commitsByRepo = data.repos.top_repos.map(repo => ({
            name: repo.name,
            value: repo.commits
        }));
        createRepoChart('repoCommits', 'repoCommitsLegend', commitsByRepo);

        const starsByRepo = data.repos.top_repos.map(repo => ({
            name: repo.name,
            value: repo.stars
        }));
        createRepoChart('repoStars', 'repoStarsLegend', starsByRepo);
    }
}

function processCommitData(commitHistory) {
    const quarters = Object.keys(commitHistory);
    const commitCounts = Object.values(commitHistory);

    return {
        labels: quarters,
        values: commitCounts
    };
}

function updateUserInfo() {
    const user = githubData.user;
    const stats = githubData.stats;
    const languages = githubData.languages;

    document.getElementById('accountAge').textContent = 
        `Account created ${user.account_age_years} years ago (${new Date(user.created_at).toLocaleDateString()})`;
    
    document.getElementById('totalStats').innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${stats.public_repos}</div>
            <div class="stat-label">Repositories</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${stats.total_stars}</div>
            <div class="stat-label">Total Stars</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${stats.total_forks}</div>
            <div class="stat-label">Total Forks</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${stats.followers}</div>
            <div class="stat-label">Followers</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${stats.following}</div>
            <div class="stat-label">Following</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${stats.contributions}</div>
            <div class="stat-label">Contributions</div>
        </div>
    `;

    document.getElementById('languageInfo').innerHTML = `
        <h5>Language Statistics</h5>
        <p>Using ${languages.total_languages} different languages</p>
        <div class="language-list">
            ${Object.entries(languages.top_languages)
                .map(([lang, count]) => `
                    <div class="language-item">
                        <span class="language-name">${lang}</span>
                        <span class="language-count">${count} repos</span>
                    </div>
                `).join('')}
        </div>
    `;

    document.getElementById('repoList').innerHTML = `
        <h5>Top Repositories</h5>
        ${githubData.repos.top_repos.map(repo => `
            <div class="repo-item">
                <a href="${repo.url}" target="_blank" class="repo-name">${repo.name}</a>
                <div class="repo-stats">
                    <span>⭐ ${repo.stars}</span>
                    <span>🍴 ${repo.forks}</span>
                    <span>📊 ${repo.language}</span>
                </div>
                <p class="repo-description">${repo.description || 'No description'}</p>
            </div>
        `).join('')}
        <p class="text-muted">Average ${githubData.repos.avg_stars_per_repo} stars per repository</p>
    `;
}

function createCommitsTimeline(data) {
    const ctx = document.getElementById('commitsTimeline');
    if (!ctx) return;

    const timelineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(22, 27, 34, 0.95)',
                titleColor: '#c9d1d9',
                bodyColor: '#8b949e',
                borderColor: '#30363d',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    title: function(context) {
                        return context[0].label;
                    },
                    label: function(context) {
                        return `${context.raw} commits`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(48, 54, 61, 0.5)',
                    drawBorder: false
                },
                ticks: { 
                    color: '#8b949e',
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(48, 54, 61, 0.5)',
                    drawBorder: false
                },
                ticks: { color: '#8b949e' }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        hover: {
            mode: 'index',
            intersect: false
        }
    };

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                borderColor: '#238636',
                backgroundColor: 'rgba(35, 134, 54, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#238636',
                pointHoverBackgroundColor: '#2ea043',
                pointBorderColor: 'rgba(0,0,0,0)',
                pointHoverBorderColor: '#fff',
                pointBorderWidth: 0,
                pointHoverBorderWidth: 2
            }]
        },
        options: timelineOptions
    });
}

function createRepoChart(canvasId, legendId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(22, 27, 34, 0.95)',
                titleColor: '#c9d1d9',
                bodyColor: '#8b949e',
                borderColor: '#30363d',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}`;
                    }
                }
            }
        },
        layout: {
            padding: {
                top: 20,
                bottom: 20
            }
        },
        cutout: '60%'
    };

    const colors = data.map((_, index) => {
        const hue = (index * 137.5) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    });

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(repo => repo.name),
            datasets: [{
                data: data.map(repo => repo.value),
                backgroundColor: colors,
                borderColor: '#0d1117',
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: chartOptions
    });

   
    const legendData = data.map((repo, index) => ({
        label: repo.name,
        value: repo.value,
        color: colors[index]
    }));
    createCustomLegend(canvasId, legendId, legendData);

    return chart;
}

function createLanguageChart(canvasId, legendId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

   
    const chartData = Object.entries(data).map(([language, value]) => ({
        language,
        value
    })).sort((a, b) => b.value - a.value);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(22, 27, 34, 0.95)',
                titleColor: '#c9d1d9',
                bodyColor: '#8b949e',
                borderColor: '#30363d',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}`;
                    }
                }
            }
        },
        layout: {
            padding: {
                top: 20,
                bottom: 20
            }
        },
        cutout: '60%'
    };

    const colors = chartData.map((_, index) => {
        const hue = (index * 137.5) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    });

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.map(item => item.language),
            datasets: [{
                data: chartData.map(item => item.value),
                backgroundColor: colors,
                borderColor: '#0d1117',
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: chartOptions
    });

    
    const legendData = chartData.map((item, index) => ({
        label: item.language,
        value: item.value,
        color: colors[index]
    }));
    createCustomLegend(canvasId, legendId, legendData);

    return chart;
}

function createCustomLegend(chartId, legendId, data) {
    const legendContainer = document.getElementById(legendId);
    if (!legendContainer) return;

    legendContainer.innerHTML = data.map(item => `
        <div class="legend-item">
            <span class="legend-color" style="background-color: ${item.color}"></span>
            <span class="legend-label">${item.label}</span>
            <span class="legend-value">${item.value}</span>
        </div>
    `).join('');

    
    const legendItems = legendContainer.querySelectorAll('.legend-item');
    const chart = Chart.getChart(chartId);

    legendItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const datasetIndex = 0; 
            const meta = chart.getDatasetMeta(datasetIndex);

           
            meta.data[index].hidden = !meta.data[index].hidden;
            
            
            item.classList.toggle('disabled');
            
            
            chart.update();
        });
    });
} 