(function () {
  const BASE_URL = "https://movie-list.alphacamp.io"
  const INDEX_URL = BASE_URL + "/api/v1/movies/"
  const POSTER_URL = BASE_URL + "/posters/"

  const dataPanel = document.getElementById("data-panel")
  const searchForm = document.getElementById("search")
  const searchInput = document.getElementById("search-input")
  const pagination = document.getElementById("pagination")
  const icon = document.getElementById("list-icon")
  const ITEM_PER_PAGE = 12
  const data = []

  const cardMode = 0
  const listMode = 1
  let originMode = 0
  let currentPage = 1

  axios
    .get(INDEX_URL)
    .then((res) => {
      const wholeMovies = res.data.results
      data.push(...wholeMovies)
      // displayMovieData(data)
      getTotalPages(data)
      getPageData(currentPage, data)
    })
    .catch((err) => console.log(err))

  // 把電影資料顯示到頁面上的函式
  function displayMovieData(data) {
    let htmlContent = ""
    if (originMode === cardMode) {
      data.forEach((movie) => {
        htmlContent += `
        <div class="col-sm-3">
           <div class="card mb-2">
             <img class="card-img-top " src="${POSTER_URL}${movie.image}" alt="Card image cap">
             <div class="card-body movie-item-body">
               <h6 class="card-title">${movie.title}</h6>
             </div>
             
             <!-- "More" button -->
             <div class="card-footer">
               <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${movie.id}">More</button>
               <button class="btn btn-info btn-add-favorite" data-id="${movie.id}">+</button>
            </div>
           </div>
       </div>
 `
      })
    } else if (originMode === listMode) {
      data.forEach((movie) => {
        htmlContent += `
        <div class="list col-12 justify-content-between">
           <div class="row align-items-center" style="border-top: 1px #D0D0D0 solid">
             <div class="card-body movie-item-body" >
               <span class="card-title">${movie.title}</span>
             </div>
           <div class="buttons">
             <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${movie.id}">More</button>
             <button class="btn btn-info btn-add-favorite" data-id="${movie.id}">+</button>
          </div>
         </div>
       </div>
 `
      })
    }
    dataPanel.innerHTML = htmlContent
  }

  // 用show API的MODAL顯示函式
  function modalShow(id) {
    const modalTitle = document.getElementById("show-movie-title")
    const modalImage = document.getElementById("show-movie-image")
    const modalDate = document.getElementById("show-movie-date")
    const modalDescription = document.getElementById("show-movie-description")
    const showUrl = INDEX_URL + id
    axios
      .get(showUrl)
      .then((res) => {
        const modalData = res.data.results
        console.log(POSTER_URL + modalData.image)
        modalTitle.textContent = modalData.title
        modalImage.innerHTML = `<img src="${POSTER_URL}${modalData.image}" class="img-fluid" alt="Responsive image">`
        modalDate.textContent = `release at : ${modalData.release_date}`
        modalDescription.textContent = modalData.description
      })
      .catch((err) => console.log(err))
  }

  // 一頁顯示12個計算總頁數函式
  function getTotalPages(data) {
    console.log(data.length)
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ""
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${
        i + 1
        }</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  // 依照頁數顯示電影清單的函式
  let paginationData = []
  function getPageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE;
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayMovieData(pageData)
  }

  // 加入我的最愛
  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
    const movie = data.find((item) => item.id === Number(id))

    if (list.some((item) => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie);
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem("favoriteMovies", JSON.stringify(list))
  }

  // MORE & + 監聽
  dataPanel.addEventListener("click", (event) => {
    let id = event.target.dataset.id
    if (event.target.matches(".btn-show-movie")) {
      modalShow(id)
    } else if (event.target.matches(".btn-add-favorite")) {
      addFavoriteItem(id)
    }
  })

  // 搜尋監聽(含分頁)
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault()

    let results = []
    const regex = new RegExp(searchInput.value, "i")

    results = data.filter((movie) => movie.title.match(regex))
    console.log(results)
    getTotalPages(results)
    getPageData(currentPage, results)
  })

  // 頁面監聽(需要再理解一次)
  pagination.addEventListener("click", (event) => {
    console.log(event.target.dataset.page)
    if (event.target.tagName === "A") {
      currentPage = event.target.dataset.page
      getPageData(currentPage)
    }
  })

  // 依照Icon顯示頁面的監聽
  icon.addEventListener("click", (event) => {
    console.log(event.target)
    if (event.target.matches(".fa-th")) {
      originMode = cardMode
    } else if (event.target.matches(".fa-bars")) {
      originMode = listMode
    }
    getPageData(currentPage, data)
  })
})()
