import os
import logging
import hashlib
import requests
import uuid
from io import BytesIO
from urllib.parse import quote
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
from dotenv import load_dotenv
from functools import wraps

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Pollination Image Generation Endpoint
POLLINATION_IMAGE_URL = 'https://image.pollinations.ai/prompt/'

# Initialize Flask application
app = Flask(__name__, static_folder='static')
app.secret_key = os.environ.get("SESSION_SECRET", "dreamy-blooms-default-secret")

# Admin credentials - in production this should be stored securely, preferably in a database
ADMIN_USERNAME = "rahul"
# Password is "flower123" hashed with sha256
ADMIN_PASSWORD = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"

# Admin login required decorator
def admin_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session or not session['admin_logged_in']:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ai_bouquet')
def ai_bouquet():
    return render_template('ai_bouquet.html')

@app.route('/shop')
def shop():
    return render_template('shop.html')

@app.route('/weddings')
def weddings():
    return render_template('weddings.html')

@app.route('/subscriptions')
def subscriptions():
    return render_template('subscriptions.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')
    
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Hash the password to compare with stored hash
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        if username == ADMIN_USERNAME and hashed_password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))
        else:
            return render_template('admin_login.html', error='Invalid username or password')
    
    return render_template('admin_login.html')

@app.route('/admin/dashboard')
@admin_login_required
def admin_dashboard():
    # In a real application, you would fetch order data from your database
    # For this demo, we're using hardcoded data with the customer names you requested
    orders = [
        {'id': 'DBO-2305', 'customer': 'Rahul', 'date': '21 May, 2025', 'amount': '₹3,999', 'status': 'new'},
        {'id': 'DBO-2304', 'customer': 'Vimal', 'date': '20 May, 2025', 'amount': '₹4,499', 'status': 'processing'},
        {'id': 'DBO-2303', 'customer': 'Joshua', 'date': '19 May, 2025', 'amount': '₹3,499', 'status': 'completed'},
        {'id': 'DBO-2302', 'customer': 'Aryaa', 'date': '18 May, 2025', 'amount': '₹5,999', 'status': 'completed'},
        {'id': 'DBO-2301', 'customer': 'Vinith', 'date': '17 May, 2025', 'amount': '₹2,999', 'status': 'canceled'}
    ]
    return render_template('admin_dashboard.html', orders=orders)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin_login'))

@app.route('/generate_bouquet', methods=['POST'])
def generate_bouquet():
    if not request.is_json:
        return jsonify({'success': False, 'error': 'Invalid request format'})
        
    data = request.json
    if data is None:
        return jsonify({'success': False, 'error': 'Invalid JSON data'})
        
    prompt = data.get('prompt', '').strip()
    
    if not prompt:
        return jsonify({'success': False, 'error': 'No prompt provided'})
    
    try:
        logger.info(f"Generating bouquet with prompt: {prompt}")
        
        # Use the client's prompt as-is since it already includes all necessary details
        enhanced_prompt = prompt
        
        # Generate a unique filename
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join('static', 'generated', filename)
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Encode the prompt for URL
        encoded_prompt = quote(enhanced_prompt)
        
        # Generate image URL with parameters
        image_url = f"{POLLINATION_IMAGE_URL}{encoded_prompt}?width=512&height=512"
        
        # Download the generated image
        response = requests.get(image_url)
        response.raise_for_status()
        
        # Save the image
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        # Return the URL of the generated image
        return jsonify({
            'success': True,
            'image_url': f"/static/generated/{filename}"
        })
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Pollination API error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate image. Please try again later.'
        }), 500
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error in generate_bouquet: {error_msg}")
        return jsonify({
            'success': False,
            'error': f'An error occurred: {error_msg}'
        }), 500

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.form
    
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    
    # In a real application, you would send an email or store in database
    # For now, we'll just return a success message
    if name and email and message:
        return jsonify({
            'success': True,
            'message': 'Thank you for your message! We will contact you soon.'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Please fill in all required fields.'
        })

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs(os.path.join('static', 'generated'), exist_ok=True)
    
    # Run app
    app.run(host='0.0.0.0', port=5000, debug=True)




