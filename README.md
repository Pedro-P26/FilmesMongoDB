# 🎬 Movie Catalog Project (MongoDB + Node.js)

This project is a web application that allows users to search, view, and comment on movies stored in a MongoDB database. It features a responsive interface with pagination, real-time search, and interactive movie details.

## 📁 Project Structure

```text
FilmesMongoDB/
├── public/
│   ├── index.html         
│   ├── style.css          
│   └── main.js            
├── routes/
│   └── movies.js          
├── .env                   
├── app.js                
└── README.md   
```

## 🚀 Features

- 🔍 **Real-time movie search**
- 📄 **View detailed movie info**
- 💬 **Add, edit, and delete comments**
- 📚 **Smart pagination system**
- 🖼️ **Display movie posters**
- ⚙️ **MongoDB database integration (`sample_mflix`)**

## 🔧 Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (collections: `embedded_movies`, `comments`)
- **Others:** dotenv, mongoose, MongoDB Atlas or local instance

## 🛠️ Installation & Usage

1. **Clone the repository:**
   ```bash
   https://github.com/Pedro-P26/FilmesMongoDB.git
   cd movie-catalog
2. **Install dependencies:**
   ```bash
   npm install
3. **Create a .env file:**
   ```bash
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/sample_mflix
4. **Run de server:**
   ```bash
   node app.js
5. **Browser:**
   ```bash
   http://localhost:5000


