import requests
from flask import Flask, render_template, request, Response

# Routes
app = Flask(__name__)

@app.route('/')
def default():
    return render_template('home.html', title='Home')

@app.route('/home')
def home():
    return render_template('home.html', title='Home')

@app.route('/projects')
def projects():
    return render_template('projects.html', title='Projects')

@app.route('/rxpulse')
def rxpulse():
    return render_template('rxpulse.html', title='RxPulse Intelligence')

@app.route('/api/v1/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy_rxpulse_api(path):
    # Proxy requests to the FastAPI backend running on port 8000
    rxpulse_url = f"http://127.0.0.1:8000/api/v1/{path}"
    
    resp = requests.request(
        method=request.method,
        url=rxpulse_url,
        headers={key: value for (key, value) in request.headers if key != 'Host'},
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False,
        params=request.args
    )

    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    headers = [(name, value) for (name, value) in resp.raw.headers.items()
               if name.lower() not in excluded_headers]

    return Response(resp.content, resp.status_code, headers)

@app.route('/art')
def art():
    return render_template('art.html', title='Art')

@app.route('/favechara')
def favechara():
    return render_template('favechara.html', title='Favorite Characters')

@app.route('/kittyclicker')
def kittyclicker():
    return render_template('kittyclicker.html', title='Kitty Clicker')


if __name__ == '__main__':
    app.run(debug=True)