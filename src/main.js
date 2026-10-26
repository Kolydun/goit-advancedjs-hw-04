import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery, PER_PAGE } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';

const form = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;

form.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSubmit(event) {
  event.preventDefault();

  const value = event.currentTarget.elements['search-text'].value.trim();

  if (!value) {
    iziToast.warning({
      message: 'Please enter a search query.',
      position: 'topRight',
    });
    return;
  }

  query = value;
  page = 1;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const { hits, totalHits } = await getImagesByQuery(query, page);

    if (hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(hits);
    updateLoadMore(totalHits);
  } catch (error) {
    showError(error);
  } finally {
    hideLoader();
    form.reset();
  }
}

async function onLoadMore() {
  page += 1;

  hideLoadMoreButton();
  showLoader();

  try {
    const { hits, totalHits } = await getImagesByQuery(query, page);

    createGallery(hits);
    scrollGallery();
    updateLoadMore(totalHits);
  } catch (error) {
    page -= 1;
    showLoadMoreButton();
    showError(error);
  } finally {
    hideLoader();
  }
}

function updateLoadMore(totalHits) {
  if (page * PER_PAGE >= totalHits) {
    hideLoadMoreButton();
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight',
    });
    return;
  }

  showLoadMoreButton();
}

function scrollGallery() {
  const card = document.querySelector('.gallery-item');
  if (!card) return;

  const { height } = card.getBoundingClientRect();
  window.scrollBy({ top: height * 2, behavior: 'smooth' });
}

function showError(error) {
  iziToast.error({
    message: `Something went wrong: ${error.message}`,
    position: 'topRight',
  });
}
