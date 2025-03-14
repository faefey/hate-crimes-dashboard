from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    print('Starting the server...')
    app.run(host='127.0.0.1', port=8000, debug=False)