
var currentPage = 1;
var lastPage;
var saveToLocalStorage = [];
let date_sorting = false;
let rate_sorting = false;
let search_clicked = false;
let currentWord = '';

const movieListContainer  = document.querySelector('.movie-list');
const current_btn = document.getElementById('current-btn');

// -----------------------------fetch API data---------------------------

function extractUsefulData(data){
    const requiredData = data.map((item)=>{
        return {
            id: item.id,
            poster: item.poster_path,
            title:item.original_title,
            vote_count: item.vote_count,
            vote_average: item.vote_average,
            release_date: item.release_date
        }
    });
    return requiredData;
}


// --------------------------Get Local Storage Data------------------------

let pagination = document.querySelector('.pagination');
function fetchDataLocalStotage(){
    clearPreviesMovies();
    var retrievedData = localStorage.getItem("LocalStorage") ?? [];
    let mainData = JSON.parse(retrievedData);
    var ids = mainData.map(({ title }) => title);
    var uniqueData = mainData.filter(({ title }, index) =>  !ids.includes(title, index + 1));

    if(date_sorting===true){ sortByDate(uniqueData); }
    if(rate_sorting==true){  sortByRate(uniqueData); }

    if(search_clicked==true){ uniqueData = search_moviename(uniqueData); }

    search_clicked = false;

    if(uniqueData.length==0){
        pagination.style.visibility = 'hidden'; 
        movieListContainer.innerHTML += `
        <div class="save-container">
            <h1>Oops! No Saved Movie Found!!</h1>
        </div>  `;
    } else {
        for(let i=0; i<uniqueData.length; i++){
            pagination.style.visibility = 'hidden'; 
            movieListContainer.innerHTML += `
            <div class="save-container">
                <img class="poster-img-save" src=${uniqueData[i].poster} alt="movie_image"/>
                <p class="title-save">${uniqueData[i].title}</p>
                <div class="vote-count-save">
                    <p class="voteCount-text-save">Votes: ${uniqueData[i].vote_count}</p>
                    <i class="fa-solid fa-heart likedNews" style="color: red; cursor: pointer;" id='save-btn-${uniqueData[i].id}'></i>
                </div>
                <p class="voteAverage-text-save">Rating: ${uniqueData[i].vote_average}</p>
            </div>  `;
        }
    }
}

// -----------------category Selection-------------------------------

const category_option = document.querySelector(".option-bar");
var category = document.getElementById('all');
category_option.addEventListener('click',(event)=>{  
    const unlikeID = event.target.className; 
    if(unlikeID.includes('option-btn')){
        category = document.getElementById(event.target.id);
        let option_btn = document.getElementsByClassName('option-btn');
        for(cl of option_btn){ cl.classList.remove("active-tab"); }
        event.target.classList.add("active-tab");
        if(category.textContent == 'All'){
            autoFetchMovieList();
        } else{
            fetchDataLocalStotage();
        }
    }
    
})

async function moviesData(currentPage){
    current_btn.innerHTML = `Current Page: ${currentPage}`;
    const URL = `https://api.themoviedb.org/3/movie/top_rated?api_key=f531333d637d0c44abc85b3e74db2186&language=en-US&page=${currentPage}`;
    let response = await fetch(URL);
    let data = await response.json();
    lastPage = data["total_pages"];
    checkLastPage();
    const results = data["results"];
    let requiredData = extractUsefulData(results);
    return requiredData;
}

function clearPreviesMovies() {
    movieListContainer.innerHTML = "";
  }

function renderNewMovies(movieList){
    // console.log(movieList);
    if(date_sorting===true){ sortByDate(movieList); }
    if(rate_sorting===true){ sortByRate(movieList); }
    if(search_clicked==true){ movieList = search_moviename(movieList); }

    search_clicked = false;

    movieList.map((eachMovie)=>{
    const {id, poster, title,  vote_count, vote_average, release_date } = eachMovie;
    
    const posterPath = `https://image.tmdb.org/t/p/original/${poster}`;
    pagination.style.visibility = 'visible'; 
    movieListContainer.innerHTML += `
    <div class="card-container">
            <img class="poster-img" src=${posterPath} alt="movie_image"/>
            <p class="title">${title}</p>
            <div class="vote-count">
                <p class="voteCount-text">Votes: ${vote_count}</p>
                <i class="fa-solid fa-heart" id='liked-btn-${id}'></i>
            </div>
            <p class="voteAverage-text">Rating: ${vote_average}</p>
        </div>
    `;
   });
}

async function autoFetchMovieList(){
    const movieList = await moviesData(currentPage);
    clearPreviesMovies();
    renderNewMovies(movieList);
}

autoFetchMovieList();

// ----------Increase Page Count------------------

const next_btn = document.getElementById('next-btn');
next_btn.addEventListener('click',()=>{
    currentPage = currentPage + 1;
    autoFetchMovieList();
});

// ----------Increase Page Count------------------

const prev_btn = document.getElementById('prev-btn');
prev_btn.addEventListener('click',()=>{
    currentPage = currentPage - 1;
    autoFetchMovieList();
});


// ----------checkLastPage------------------

function checkLastPage(){
    if(currentPage==1){
        prev_btn.disabled = true;
    } else {
        prev_btn.disabled = false;
    }

    if(currentPage==lastPage){
        next_btn.disabled = true;
    } else {
        next_btn.disabled = false;
    }
}

movieListContainer.addEventListener('click',(event)=>{
    if(category.textContent==='All' && event.target.id.includes('liked-btn')){
        const getLikedId = document.getElementById(event.target.id);
        getLikedId.style.color="red";
        var parentDiv = document.getElementById(event.target.id).parentElement.parentElement;  
        saveToLocalStorage = JSON.parse(localStorage.getItem('LocalStorage')) ?? [];
        let voteStr = parentDiv.children[2].textContent.split(":");
        let rateStr = parentDiv.children[3].textContent.split(":");

        var x = document.getElementById(event.target.id).parentElement; 
        let matches = x.children[1].id.match(/(\d+)/);

        var saveMovieObject = {
            "id": matches[0],
            "poster": parentDiv.children[0].src,
            "title": parentDiv.children[1].textContent,
            "vote_count": voteStr[1],
            "vote_average": rateStr[1],
        };
         //------------------Saved News Pused To LocalStorage----------------------
         saveToLocalStorage.push(saveMovieObject);
         console.log(saveToLocalStorage);
         localStorage.setItem('LocalStorage', JSON.stringify(saveToLocalStorage));
    }
});


// ---------------------------Sorting--------------------------------------

const sort_bar = document.querySelector('.sort-bar');

sort_bar.addEventListener('click',(event)=>{ 
    // ----------Sort By date----------
    if(event.target.id.includes('sort-date')){
        if(event.target.className.includes('sort-active')){
            event.target.classList.remove('sort-active');
            console.log(category.textContent);
            if(category.textContent == 'All'){
                autoFetchMovieList();
            } else{
                fetchDataLocalStotage();
            }
            date_sorting = false;
        } else {
            event.target.classList.add('sort-active');
            date_sorting = true;
            if(category.textContent == 'All'){
                autoFetchMovieList();
            } else{
                fetchDataLocalStotage();
            }
        }
    } 

        // ----------Sort By rating----------
        if(event.target.id.includes('sort-rate')){
            if(event.target.className.includes('sort-active')){
                event.target.classList.remove('sort-active');
                if(category.textContent == 'All'){
                    autoFetchMovieList();
                } else{
                    fetchDataLocalStotage();
                }
                rate_sorting = false;
            } else {
                event.target.classList.add('sort-active');
                rate_sorting = true;
                if(category.textContent == 'All'){
                    autoFetchMovieList();
                } else{
                    fetchDataLocalStotage();
                }
            }
        } 
})

function sortByDate(moveList){
    moveList.sort((a, b) => {
        let dateA = new Date(a.release_date);
        let dateB = new Date(b.release_date);
        return dateA - dateB;

    });
}

function sortByRate(moveList){
    moveList.sort((a, b) => {
        return a.vote_average - b.vote_average;
    });
}

// ---------------------------searchbar-----------------------

let searchBar = document.getElementById('serach-text');
let searchBtn = document.getElementById('search-btn');

searchBar.addEventListener('keyup',(event)=>{
    currentWord = event.target.value;
});

searchBtn.addEventListener('click',()=>{
    if(currentWord==''){
        search_clicked = false;
        autoFetchMovieList();
    }else{
        search_clicked = true;
        autoFetchMovieList();
    }
    searchBar.value = "";
})

function search_moviename(moveList) {
    const filteredValue = moveList.filter((item)=>{
        return item.title.includes(currentWord);
     });
     return filteredValue;
}


//--------------------------Delete Saved News--------------------------------

const btnUnlike = document.querySelector('.likedNews');
movieListContainer.addEventListener('click',(e)=>{
    const unlikeID = e.target.id;
    var retrievedData1 = localStorage.getItem("LocalStorage");
    var mainData1 = JSON.parse(retrievedData1);
    for(let i=0; i<mainData1.length; i++){
        if(category.innerText==='Favorites' && unlikeID.includes(mainData1[i].id)){
            mainData1.splice(i,1);
            localStorage.setItem('LocalStorage', JSON.stringify(mainData1));
            fetchDataLocalStotage();
        }
    }
});

