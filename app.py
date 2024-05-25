from flask import Flask 
from flask import render_template
import flask

# Routes
app = Flask(__name__)

@app.route('/')
def default():
    return render_template('def.html', title='Default')

@app.route('/home')
def home():
    return render_template('home.html', title='Home')

@app.route('/projects')
def projects():
    return render_template('projects.html', title='Projects')

@app.route('/art')
def art():
    return render_template('art.html', title='Art')

@app.route('/favechara')
def favechara():
    return render_template('favechara.html', title='Favorite Characters')

if __name__ == '__main__':
    app.run(debug=True)