const header = document.querySelector('h1'),
timestamp = document.querySelector(".user-details .timestamp"),
commentContainer = document.querySelector(".comments-container"),
commentBox = document.querySelector(".comment-box .comment"),
inputBox = document.querySelector('.input-box'),
userInput = document.querySelector(".input-box textarea"),
addBtn = document.querySelector(".input-box button"),
intersectTrap = document.querySelector('.intersect-trap');


let comments = JSON.parse(localStorage.getItem("comments"));
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "[]");
let isUpdate = false, isReply = false, isUpdateReply = false, updateCommentId, updateReplyId, replyingTo;


const display = (jsondata) => {
  addBtn.innerText = 'Send';
  if (comments) console.log(comments);
  else {
    localStorage.setItem("currentUser", JSON.stringify(jsondata.currentUser));
    localStorage.setItem("comments", JSON.stringify(jsondata.comments));
  }
};

fetch("./data.json")
.then(response => {
   return response.json();
})
.then(jsondata => {
  display(jsondata);
});

function showNotes() {
    if(!comments) return;
    comments = JSON.parse(localStorage.getItem("comments"));
    commentContainer.innerHTML = '';
    comments = comments.filter(item => item != null);
    
    comments.forEach((comment, commentId) => {
        let filterContent = comment.content.replaceAll("\n", '<br/>');
        let commentBox = `<li class="comment-box comment-item${commentId}">
                        <div class="user-details box">
                          <picture>
                            <source srcset=${comment.user.image.webp} media="(min-width: 969px)"/>
                            <source srcset=${comment.user.image.png} media="(min-width: 375px)"/>
                            <img src=${comment.user.image.png} alt="user_name"/>
                          </picture>
                          <p class="name">${comment.user.username}</p>
                          <p class='user-badge' style= 'display: ${comment.user.username == currentUser.username? 'block' : 'none'};'>${comment.user.username == currentUser.username? '<span>You</span>' : ''}</p>
                          <p class="timestamp">${isNaN(comment.createdAt) == false ? updateTimeStamp(comment.createdAt) : (comment.createdAt) }</p>
                        </div>
                        
                        <div class="comment box">
                          <p>${filterContent}</p>
                        </div>
                        
                        <div class="actions box">
                          ${checkForActions(comment, true, false, commentId)}
                        </div>
                        
                        <div class="votes box">
                          <img onclick="handleVote(true, true, ${commentId}, false)" class="plus" src="./images/icon-plus.svg" />
                          <p>${comment.score}</p>
                          <img onclick="handleVote(false, true, ${commentId}, false)" class="minus" src="./images/icon-minus.svg" />
                        </div>
                      </li>
                      <ul class='reply-container'>${checkReply(comment, commentId)}</ul>`;

        commentContainer.insertAdjacentHTML("afterbegin", commentBox);
        
        function checkReply(comment) {
          if (comment.replies.length !== 0) {
            comment.replies = comment.replies.filter((item) => item != null);
            const replyBoxes = comment.replies.map((reply, replyId) => {
              let filterContent = reply.content.replaceAll("\n", '<br/>');
              return `<li class="reply-box reply-item${replyId}">
                        <div class="user-details box">
                          <picture>
                            <source srcset=${reply.user.image.webp} media="(min-width: 969px)"/>
                            <source srcset=${reply.user.image.png} media="(min-width: 375px)"/>
                            <img src=${reply.user.image.png} alt="user_name"/>
                          </picture>
                          <p class="name">${reply.user.username}</p>
                          <p class='user-badge' style= 'display: ${reply.user.username == currentUser.username? 'block' : 'none'};'>${reply.user.username == currentUser.username? '<span>You</span>' : ''}</p>
                          <p class="timestamp">${isNaN(reply.createdAt) == false ? updateTimeStamp(reply.createdAt) : (reply.createdAt) }</p>
                        </div>
                        
                        <div class="comment box">
                          <p><span class="replying-to">@${reply.replyingTo}</span> ${filterContent}</p>
                        </div>
                        
                        <div class="actions box">
                          ${checkForActions(comment, false, reply, replyId)}
                        </div>
                        
                        <div class="votes box">
                          <img onclick="handleVote(true, false, ${commentId}, ${replyId})" class="plus" src="./images/icon-plus.svg" />
                          <p>${reply.score}</p>
                          <img onclick="handleVote(false, false, ${commentId}, ${replyId})" class="minus" src="./images/icon-minus.svg" />
                        </div>
                      </li>`;
            });
            return replyBoxes.join('');
          } else {
            return '';
          }
        }
        
        
        function checkForActions(comment, isComment, reply, replyId) {
          let commentActions = [`<span onclick="deleteNote(${commentId}, ${isComment})" class="delete"><img src="./images/icon-delete.svg" alt="."/>Delete</span>`,
          `<span onclick="editNote(${commentId}, ${isComment})" class='edit'><img src='./images/icon-edit.svg' alt='.'/>Edit</span>`];
          
          let replyActions = [`<span onclick="deleteNote(${commentId}, ${isComment}, ${replyId})" class="delete"><img src="./images/icon-delete.svg" alt="."/>Delete</span>`,
                    `<span onclick="editNote(${commentId}, ${isComment}, ${replyId})" class='edit'><img src='./images/icon-edit.svg' alt='.'/>Edit</span>`];
          
          if (isComment) {
            if (comment.user.username === currentUser.username) {
              return commentActions.join(' <br/> ');
            } else {
              return `<span onclick="replyComment(${commentId}, ${isComment})" class="reply"><img src="./images/icon-reply.svg" alt="."/>Reply</span>`;
            }
          } else {
            if (reply.user.username === currentUser.username) {
              return replyActions.join(' <br/> ');
            } else {
              return `<span onclick="replyComment(${commentId}, ${isComment}, ${replyId})" class="reply"><img src="./images/icon-reply.svg" alt="."/>Reply</span>`;
            }
          }
        }
    });
}

if (!isUpdate) {
  setInterval(showNotes, 1000);
}
console.log(comments);

function deleteNote(contentId, isComment, replyId) {
  console.log('replyId', replyId);
    let confirmDel = confirm("Are you sure you want to delete this note?");
    if(!confirmDel) return;
    if (isComment) {
      comments.splice(contentId, 1);
    } else {
      comments[contentId].replies.splice(replyId, 1);
    }
    localStorage.setItem("comments", JSON.stringify(comments));
}

function replyComment(commentId, isComment, replyId) {
  if (isComment) {
    isReply = true;
    userInput.focus();
    updateCommentId = commentId;
    replyingTo = comments[commentId].user.username;
  } else {
    isReply = true;
    userInput.focus();
    updateCommentId = commentId;
    updateReplyId = replyId;
    replyingTo = comments[commentId].replies[replyId].user.username;
  }
  addBtn.innerText = 'Reply';
  userInput.nextElementSibling.classList.remove('disabled');
}

function editNote(itemId, isComment, replyId) {
  if (isComment) {
    filterContent = comments[itemId].content.replaceAll("<br/>", '\r\n');
    isUpdate = true;
    updateCommentId = itemId;
    userInput.value = filterContent;
    userInput.focus();
    addBtn.innerText = 'Update';
    userInput.nextElementSibling.classList.remove('disabled');
  } else {
    filterContent = comments[itemId].replies[replyId].content.replaceAll("<br/>", '\r\n');
    isUpdate = true;
    isUpdateReply = true;
    updateCommentId = itemId;
    updateReplyId = replyId;
    userInput.value = filterContent;
    userInput.focus();
    addBtn.innerText = 'Update';
    userInput.nextElementSibling.classList.remove('disabled');
  }
}

function handleVote(isIncrement, isComment, commentId, replyId) {
  const value = isIncrement ? 1 : -1;
  if (isComment) {
    comments[commentId].score += value;
  } else {
    comments[commentId].replies[replyId].score += value;
  }
  localStorage.setItem("comments", JSON.stringify(comments));
}

function scrollHere(itemId, isComment, isEdit) {
  let sel = `.${isComment == true ? 'comment' : 'reply'}-item${itemId}`, elm;
  if (isEdit) {
    alert(sel);
    elm = document.querySelector(sel);
    elm.scrollIntoView(true);
  }
}

function updateTimeStamp(createDate) {
  let currentDate = new Date();
  let timeDiff = Math.round((currentDate.getTime()) - createDate);
  
  if (timeDiff < 60000) {
    return 'just now';
  } else if (timeDiff >= 60000 && timeDiff < 3600000) {
    let minuteRange = Math.round(timeDiff / 60000);
    if (minuteRange == 1) {
      return 'a minute ago';
    } else {
      return `${minuteRange} mins ago`;
    }
  } else if (timeDiff >= 3600000 && timeDiff < 86400000) {
    let hourRange = Math.round(timeDiff / 3600000);
    if (hourRange == 1) {
      return 'an hour ago';
    } else {
      return `${hourRange} hrs ago`;
    }
  } else if (timeDiff >= 86400000 && timeDiff < 604800000) {
    let weekRange = Math.round(timeDiff / 86400000);
    if (weekRange == 1) {
      return 'a week ago';
    } else {
      return `${weekRange} wks ago`;
    }
  } else if (timeDiff >= 604800000 && timeDiff < 2592000000) {
    let monthRange = Math.round(timeDiff / 604800000);
    if (monthRange == 1) {
      return 'a month ago';
    } else {
      return `${monthRange} month ago`;
    }
  } else {
    return `some years ago`;
  }
}

userInput.nextElementSibling.classList.add('disabled');

userInput.addEventListener('keyup', function () {
  if (this.value == '') {
    this.nextElementSibling.classList.add('disabled');
  } else {
    this.nextElementSibling.classList.remove('disabled');
  }
});

addBtn.addEventListener("click", function () {
    let content = userInput.value.trim();
    const createDate = new Date().getTime();
    
    if (!isReply) {
      if (!isUpdate) {
        if (content) {
          const commentInfo = {
            id: Number(`${(comments.length) + 1}`),
            content: `${content}`,
            createdAt: `${createDate}`,
            score: 0,
            user: {
              image: {
                png: `${currentUser.image.png}`,
                webp: `${currentUser.image.webp}`
              },
              username: `${currentUser.username}`
            },
            replies: []
          }
          comments = comments.filter(item => item != null);
          comments.push(commentInfo);
          console.log(commentInfo);
          scrollHere(`${(comments.length) - 1}`, false);
        }
      } else {
        isUpdate = false;
        this.innerText = 'Send';
        if (!isUpdateReply) {
          comments[updateCommentId].content = content;
          scrollHere(updateCommentId, true, true);
        } else {
          isUpdateReply = false;
          comments[updateCommentId].replies[updateReplyId].content = content;
          scrollHere(updateReplyId, false, true);
        }
      }
    } else {
      if (content) {
          const replyInfo = {
            id: Number(`${(comments[updateCommentId].replies.length) + 1}`),
            content: `${content}`,
            createdAt: `${createDate}`,
            score: 0,
            replyingTo: `${replyingTo}`,
            user: {
              image: {
                png: `${currentUser.image.png}`,
                webp: `${currentUser.image.webp}`
              },
              username: `${currentUser.username}`
            }
          }
          isReply = false;
          addBtn.innerText = 'Send';
          comments = comments.filter(item => item != null);
          comments[updateCommentId].replies.push(replyInfo);
          console.log(replyInfo);
          scrollHere(`${(comments.length) - 1}`, false);
        }
    }
    
    localStorage.setItem("comments", JSON.stringify(comments));
    console.log(comments);
    userInput.value = '';
    userInput.nextElementSibling.classList.add('disabled');
});



userInput.addEventListener('keyup', function() {
  this.style.removeProperty('height');
  this.style.height = (this.scrollHeight + 2) + 'px';
});

userInput.addEventListener('mousedown', function() {
  this.style.removeProperty('height');
  this.style.height = (this.scrollHeight + 2) + 'px';
});



//to check when element get's position sticky
var observer = new IntersectionObserver(function(entries) {
  // no intersection 
  if (entries[0].intersectionRatio === 0) {
    //alert('Is sticky!');
    inputBox.classList.add("is-sticky");
  }
  // fully intersects 
  else if (entries[0].intersectionRatio === 1) {
    //alert('Is not sticky!');
    inputBox.classList.remove("is-sticky");
  }
}, {
  threshold: [0, 1]
});

observer.observe(intersectTrap);


let scrollElements = document.querySelectorAll(".scroll");
let previousScrollPosition = 0;

const isScrollingDown = () => {
  let goingDown = false;

  let scrollPosition = window.pageYOffset;

  if (scrollPosition > previousScrollPosition) {
    goingDown = true;
  }

  previousScrollPosition = scrollPosition;

  return goingDown;
};

const handleScroll = () => {
  if (isScrollingDown()) {
    //console.log("scrolling-down");
    scrollElements[0].classList.remove('fade-in-top-one');
    scrollElements[0].classList.add('fade-in-bottom-one');
    scrollElements[1].classList.remove('fade-in-bottom');
    scrollElements[1].classList.add('fade-in-top');
  } else {
    //console.log("scrolling-up");
    scrollElements[0].classList.remove('fade-in-bottom-one');
    scrollElements[0].classList.add('fade-in-top-one');
    scrollElements[1].classList.remove('fade-in-top');
    scrollElements[1].classList.add('fade-in-bottom');
  }
};

// throttle function from lodash library
//const scrollThrottle = _.throttle(handleScroll, 100);
window.addEventListener("scroll", function(e) {
  if (((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 100)  || (userInput == document.activeElement)) {
    //scrollElements[0].classList.remove('fade-in-bottom-one');
    //scrollElements[0].classList.add('fade-in-top-one');
    scrollElements[1].classList.add('fade-in-bottom');
    scrollElements[1].classList.remove('fade-in-top');
  } else {
    handleScroll();
  }
});