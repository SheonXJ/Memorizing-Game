const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwait',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatch: 'CardMatch',
  GameFinished: 'GameFinished',
}

const symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const utility = {
  //Fisher–Yates shuffle
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = symbols[Math.floor(index / 13)]
    return `
        <p>${number}</p>
        <img src=${symbol} alt="">
        <p>${number}</p>
    `
  },

  getCardElement(index) {
    const number = this.transformNumber((index % 13) + 1 )
    const symbol = symbols[Math.floor(index/13)]
    return `
      <div data-index="${index}" class="card back"></div>
    `
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        //如果是正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      //如果是背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerText = `Score : ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').innerText = `You've tried ${times} times !`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      //當動畫結束,移除'wrong'
      card.addEventListener("animationend" , event => {
        event.target.classList.remove('wrong')
        , {once: true} //執行一次就卸載Listener
      }) 
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <div>
        <h2>Complete!</h2>
        <p>score : ${model.score}</p>
        <p>You've tried : ${model.triedTimes} times</p>
      </div>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照不同的狀態,做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        return
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        if (model.isRevealedCardsMatched()) {
          //配對成功
          this.currentState = GAME_STATE.CardMatch
          view.renderScore((model.score += 10))
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          } 
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards , 1000)
        }
        return
    }
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}

const model = {
  revealedCards: [],

  score: 0,

  triedTimes: 0,

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  }
}

controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click' , event => {
    controller.dispatchCardAction(card)
  })
})
