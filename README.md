# E-Commerce Flower Shop Website

This repository contains the source code for an E-Commerce Flower Shop Website. The project provides an online platform for users to browse, select, and purchase flowers conveniently, featuring both a visually appealing frontend and a dynamic backend built with Flask.

## Features

- **Online Flower Catalog:** Browse a variety of flowers and arrangements.
- **Shopping Cart:** Add flowers to your cart for seamless checkout.
- **AI Bouquet Generator:** Create AI-generated bouquet images.
- **Responsive Design:** Accessible on both desktop and mobile devices.
- **Admin Dashboard:** Manage orders, view customer info, and handle shop operations.
- **User-Friendly Interface:** Simple and intuitive navigation.

![Screenshot 1](https://github.com/user-attachments/assets/b22fb8c7-3da4-4463-be35-127915e2a601)
![Screenshot 2](https://github.com/user-attachments/assets/9ddf609b-1e6d-4f5b-9566-50e9203d1218)
![Screenshot 3](https://github.com/user-attachments/assets/46115b8e-5fef-4af5-8a4d-8a6d1bc36d8b)
![Screenshot 4](https://github.com/user-attachments/assets/02dad176-b95c-4632-8b03-7bece7b6304f)

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python (Flask)
- **Templating:** Jinja2 (via Flask's `render_template`)
- **Session Management:** Flask sessions
- **Image Generation:** Pollinations AI image API
- **Other:** dotenv for environment variables, hashlib for password hashing

## Project Structure

```
app.py                 # Flask backend application
static/                # Static files (CSS, JS, images)
templates/             # HTML templates (Jinja2)
README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Python 3.x
- pip

### Setup

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/RAHUL04012006/E-Commerce-Flower-Shop-Website.git
    cd E-Commerce-Flower-Shop-Website
    ```

2. **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    > If `requirements.txt` is missing, install at least:
    > ```bash
    > pip install flask python-dotenv requests
    > ```

3. **Set Up Environment Variables:**
    - Create a `.env` file in the root directory.
    - Add your secret key:  
      ```
      SESSION_SECRET=your_secret_key
      ```

4. **Run the Application:**
    ```bash
    python app.py
    ```

5. **Open in Browser:**
    - Visit `http://localhost:5000/` to view the site.

## Folder Structure

- `/app.py`: Main Flask application file containing all routes and backend logic.
- `/static/`: Contains all CSS, JS, and image files used in the frontend.
- `/templates/`: Contains all Jinja2/HTML templates for rendering views.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project currently does not have a specified license. Please check with the repository owner for usage terms.

## Author

[RAHUL04012006](https://github.com/RAHUL04012006)

---

> View the repository on [GitHub](https://github.com/RAHUL04012006/E-Commerce-Flower-Shop-Website)
