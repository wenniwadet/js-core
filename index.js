const container = document.querySelector(".container");
const searchInput = container.querySelector(".search-input");
const repoList = container.querySelector(".repo-list");
let dropList = document.querySelector(".drop-list");

function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

function getValidRequest() {
  const arr = searchInput.value.split("");
  const result = arr.filter((char) => char !== " ");
  return result.join("");
}

function createElement(tagName, className, textContent) {
  const element = document.createElement(tagName);
  element.classList.add(className);
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}

const debouncedSearchRepo = debounce(searchRepo, 500);

searchInput.addEventListener("keyup", () => {
  const validRequest = getValidRequest();

  if (validRequest.length === 0 && dropList) {
    setTimeout(() => {
      dropList.remove();
    }, 1000);
  }
  if (validRequest.length !== 0) {
    debouncedSearchRepo(validRequest);
  }
});

repoList.addEventListener("click", (event) => {
  const element = event.target;

  if (element.tagName === "BUTTON") {
    const parentEl = element.parentElement;
    parentEl.remove();
  }
});

async function searchRepo(request) {
  try {
    if (searchInput.value.length === 0) {
      return;
    }

    if (dropList) {
      dropList.remove();
    }

    const response = await fetch(`https://api.github.com/search/repositories?q=${request}&per_page=5`);
    const repositories = await response.json();

    dropList = createElement("ul", "drop-list");

    repositories.items.forEach((repo) => {
      const dropItem = createElement("li", "drop-item", repo.name);
      dropItem.setAttribute("data-owner", repo.owner.login);
      dropItem.setAttribute("data-stars", repo.stargazers_count);
      dropList.append(dropItem);
    });

    dropList.addEventListener("click", (event) => {
      const element = event.target;
      const repoItem = createElement("li", "repo-item");
      const repoItemContent = createElement("div", "repo-item__content");
      const repoItemButton = createElement("button", "repo-item__button");
      repoItemContent.insertAdjacentHTML(
        "afterbegin",
        `
        <span class="repo-item__name">Name: ${element.textContent}</span>
        <span class="repo-item__owner">Owner: ${element.dataset.owner}</span>
        <span class="repo-item__stars">Stars: ${element.dataset.stars}</span>
        `
      );
      repoItem.append(repoItemContent);
      repoItem.append(repoItemButton);
      repoList.append(repoItem);
      searchInput.value = "";
      dropList.remove();
    });

    searchInput.after(dropList);
  } catch (error) {
    alert(error);
  }
}
