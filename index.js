const searchInput = document.querySelector(".search__input");
const dropList = document.querySelector(".drop-list");
const repoList = document.querySelector(".repo-list");

function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);
  element.classList.add(className);
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}

async function searchRepo(value) {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${value}&per_page=5`
  );
  const { items } = await response.json();
  return items;
}

function search() {
  dropList.style.display = "";
  if (dropList.textContent !== "") {
    dropList.textContent = "";
  }
  if (searchInput.value.length !== 0) {
    searchRepo(searchInput.value)
      .then((repositories) => {
        createItemsDropList(repositories);
        dropList.style.display = "block";
      })
      .catch((error) => {
        console.log(error);
        alert("Произошла ошибка, повторите запрос позднее");
      });
  }
}

function createItemsDropList(repositories) {
  dropList.style.display = "block";
  repositories.forEach((repository) => {
    const dropItem = createElement("li", "drop-list__item", repository.name);
    dropItem.setAttribute("data-owner", repository.owner.login);
    dropItem.setAttribute("data-stars", repository.stargazers_count);
    dropList.append(dropItem);
  });
}

function createItemsRepoList(event) {
  const element = event.target;
  const repoList = document.querySelector(".repo-list");
  const repoItem = createElement("li", "repo-list__item");
  const repoItemDescription = createElement("div", "repo-list__description");
  const repoItemButton = createElement("button", "repo-list__button");
  const repoItemName = createElement(
    "span",
    "repo-list__name",
    `Name: ${element.textContent}`
  );
  const repoItemOwner = createElement(
    "span",
    "repo-list__owner",
    `Owner: ${element.dataset.owner}`
  );
  const repoItemStars = createElement(
    "span",
    "repo-item__stars",
    `Stars: ${element.dataset.stars}`
  );

  repoItemDescription.append(repoItemName);
  repoItemDescription.append(repoItemOwner);
  repoItemDescription.append(repoItemStars);

  repoItem.append(repoItemDescription);
  repoItem.append(repoItemButton);

  repoList.append(repoItem);
}

searchInput.addEventListener("input", debounce(search, 500));

dropList.addEventListener("click", (event) => {
  searchInput.value = "";
  dropList.textContent = "";
  dropList.style.display = "";

  if (repoList.children.length <= 2) {
    createItemsRepoList(event);
  } else {
    alert("Вы добавили максимальное количество репозиториев");
  }
});

repoList.addEventListener("click", (event) => {
  if (event.target.tagName === "BUTTON") {
    const parentEl = event.target.closest(".repo-list__item");
    parentEl.remove();
  }
});
