
const chartColors = {
    background: '#0d1117',
    cardBg: '#161b22',
    border: '#30363d',
    text: '#c9d1d9',
    textSecondary: '#8b949e',
    green: '#238636',
    blue: '#58a6ff',
    purple: '#8957e5',
    orange: '#f78166',
    red: '#f85149',
    yellow: '#d29922'
};


const languageColors = {
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Unknown': '#8b949e'
};


const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: chartColors.cardBg,
            titleColor: chartColors.text,
            bodyColor: chartColors.textSecondary,
            borderColor: chartColors.border,
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            usePointStyle: true
        }
    }
};

// Donut grafik seçenekleri
const donutOptions = {
    ...commonChartOptions,
    cutout: '60%',
    radius: '90%'
};


function getLanguageColor(language) {
    return languageColors[language] || languageColors['Unknown'];
}


function createCustomLegend(chartId, legendId, data) {
    const legendContainer = document.getElementById(legendId);
    legendContainer.innerHTML = '';

    data.forEach((item, index) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const colorBox = document.createElement('span');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = item.color;
        
        const label = document.createElement('span');
        label.textContent = `${item.label} (${item.value})`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });
}


function createCommitsTimeline(data) {
    const ctx = document.getElementById('commitsTimeline');
    if (!ctx) return;

    const timelineOptions = {
        ...commonChartOptions,
        plugins: {
            ...commonChartOptions.plugins,
            legend: { display: false }
        },
        scales: {
            x: {
                grid: {
                    color: chartColors.border,
                    drawBorder: false
                },
                ticks: { color: chartColors.textSecondary }
            },
            y: {
                grid: {
                    color: chartColors.border,
                    drawBorder: false
                },
                ticks: { color: chartColors.textSecondary }
            }
        }
    };

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                borderColor: chartColors.green,
                backgroundColor: 'rgba(35, 134, 54, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: chartColors.green
            }]
        },
        options: timelineOptions
    });
}


function createLanguageChart(canvasId, legendId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map(lang => getLanguageColor(lang));

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: chartColors.background,
                borderWidth: 2
            }]
        },
        options: donutOptions
    });

    
    const legendData = labels.map((label, index) => ({
        label: label,
        value: values[index],
        color: colors[index]
    }));
    createCustomLegend(canvasId, legendId, legendData);

    return chart;
}

function createRepoChart(canvasId, legendId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

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
                borderColor: chartColors.background,
                borderWidth: 2
            }]
        },
        options: donutOptions
    });

    
    const legendData = data.map((repo, index) => ({
        label: repo.name,
        value: repo.value,
        color: colors[index]
    }));
    createCustomLegend(canvasId, legendId, legendData);

    return chart;
}


function createCommitHistoryChart(data) {
    return new Chart(
        document.getElementById('commitHistory'),
        {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Commitler',
                    data: data.values,
                    borderColor: chartColors.secondary,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: chartColors.background
                }]
            },
            options: commonChartOptions
        }
    );
}


function createYearlyActivityChart(data) {
    return new Chart(
        document.getElementById('yearlyActivity'),
        {
            type: 'bar',
            data: {
                labels: Object.keys(data),
                datasets: [
                    {
                        label: 'Repositories',
                        data: Object.values(data).map(d => d.repos),
                        backgroundColor: chartColors.primary
                    },
                    {
                        label: 'Commits',
                        data: Object.values(data).map(d => d.commits),
                        backgroundColor: chartColors.secondary
                    }
                ]
            },
            options: {
                ...commonChartOptions,
                plugins: {
                    legend: {
                        labels: { color: chartColors.text }
                    },
                    title: {
                        display: true,
                        text: 'Yearly Activity',
                        color: chartColors.text
                    }
                }
            }
        }
    );
}


function createTopReposChart(repos) {
    return new Chart(
        document.getElementById('topRepos'),
        {
            type: 'bar',
            data: {
                labels: repos.map(r => r.name),
                datasets: [
                    {
                        label: 'Stars',
                        data: repos.map(r => r.stars),
                        backgroundColor: chartColors.primary
                    },
                    {
                        label: 'Forks',
                        data: repos.map(r => r.forks),
                        backgroundColor: chartColors.secondary
                    }
                ]
            },
            options: {
                ...commonChartOptions,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        labels: { color: chartColors.text }
                    },
                    title: {
                        display: true,
                        text: 'Top Repositories',
                        color: chartColors.text
                    }
                }
            }
        }
    );
} 