export interface VocabularyCard {
  id: number
  welsh: string
  english: string
  pronunciation: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
  points: number
  mastered: boolean
  lastReviewed?: Date
  reviewCount: number
}

export interface UserProgress {
  totalPoints: number
  masteredCards: number
  reviewedToday: number
}

export class VocabularyService {
  private storageKey = "flipcymraeg_vocabulary_progress"
  private userProgressKey = "flipcymraeg_user_progress"

  getVocabularyData(): VocabularyCard[] {
    return [
      // Greetings
      {
        id: 1,
        welsh: "Bore da",
        english: "Good morning",
        pronunciation: "BOH-reh dah",
        difficulty: "Beginner",
        category: "Greetings",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 2,
        welsh: "Prynhawn da",
        english: "Good afternoon",
        pronunciation: "PRIN-hown dah",
        difficulty: "Beginner",
        category: "Greetings",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 3,
        welsh: "Nos da",
        english: "Good night",
        pronunciation: "nohs dah",
        difficulty: "Beginner",
        category: "Greetings",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 4,
        welsh: "Helo",
        english: "Hello",
        pronunciation: "HEH-lo",
        difficulty: "Beginner",
        category: "Greetings",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 5,
        welsh: "Hwyl fawr",
        english: "Goodbye",
        pronunciation: "HOO-il vowr",
        difficulty: "Beginner",
        category: "Greetings",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 6,
        welsh: "Sut mae?",
        english: "How are you?",
        pronunciation: "seet my",
        difficulty: "Beginner",
        category: "Greetings",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },

      // Politeness
      {
        id: 7,
        welsh: "Diolch",
        english: "Thank you",
        pronunciation: "DEE-olkh",
        difficulty: "Beginner",
        category: "Politeness",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 8,
        welsh: "Diolch yn fawr",
        english: "Thank you very much",
        pronunciation: "DEE-olkh un vowr",
        difficulty: "Beginner",
        category: "Politeness",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 9,
        welsh: "Croeso",
        english: "Welcome/You're welcome",
        pronunciation: "KROY-so",
        difficulty: "Beginner",
        category: "Politeness",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 10,
        welsh: "Mae'n ddrwg gen i",
        english: "I'm sorry",
        pronunciation: "mine throg gen ee",
        difficulty: "Intermediate",
        category: "Politeness",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 11,
        welsh: "Esgusodwch fi",
        english: "Excuse me",
        pronunciation: "es-GEE-soh-dooch vee",
        difficulty: "Intermediate",
        category: "Politeness",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },

      // Numbers
      {
        id: 12,
        welsh: "Un",
        english: "One",
        pronunciation: "een",
        difficulty: "Beginner",
        category: "Numbers",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 13,
        welsh: "Dau",
        english: "Two",
        pronunciation: "die",
        difficulty: "Beginner",
        category: "Numbers",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 14,
        welsh: "Tri",
        english: "Three",
        pronunciation: "tree",
        difficulty: "Beginner",
        category: "Numbers",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 15,
        welsh: "Pedwar",
        english: "Four",
        pronunciation: "PED-war",
        difficulty: "Beginner",
        category: "Numbers",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 16,
        welsh: "Pump",
        english: "Five",
        pronunciation: "pimp",
        difficulty: "Beginner",
        category: "Numbers",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 17,
        welsh: "Chwech",
        english: "Six",
        pronunciation: "khoo-ekh",
        difficulty: "Beginner",
        category: "Numbers",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 18,
        welsh: "Saith",
        english: "Seven",
        pronunciation: "sythe",
        difficulty: "Beginner",
        category: "Numbers",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 19,
        welsh: "Wyth",
        english: "Eight",
        pronunciation: "ooith",
        difficulty: "Beginner",
        category: "Numbers",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 20,
        welsh: "Naw",
        english: "Nine",
        pronunciation: "now",
        difficulty: "Beginner",
        category: "Numbers",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 21,
        welsh: "Deg",
        english: "Ten",
        pronunciation: "deeg",
        difficulty: "Beginner",
        category: "Numbers",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },

      // Family
      {
        id: 22,
        welsh: "Teulu",
        english: "Family",
        pronunciation: "TIE-lee",
        difficulty: "Beginner",
        category: "Family",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 23,
        welsh: "Mam",
        english: "Mother",
        pronunciation: "mam",
        difficulty: "Beginner",
        category: "Family",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 24,
        welsh: "Tad",
        english: "Father",
        pronunciation: "tad",
        difficulty: "Beginner",
        category: "Family",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 25,
        welsh: "Brawd",
        english: "Brother",
        pronunciation: "browd",
        difficulty: "Beginner",
        category: "Family",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 26,
        welsh: "Chwaer",
        english: "Sister",
        pronunciation: "khwy-er",
        difficulty: "Beginner",
        category: "Family",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 27,
        welsh: "Plant",
        english: "Children",
        pronunciation: "plant",
        difficulty: "Beginner",
        category: "Family",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 28,
        welsh: "Cariad",
        english: "Love/Darling",
        pronunciation: "KAH-ree-ad",
        difficulty: "Intermediate",
        category: "Family",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },

      // Places
      {
        id: 29,
        welsh: "Cymru",
        english: "Wales",
        pronunciation: "KUM-ree",
        difficulty: "Beginner",
        category: "Places",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 30,
        welsh: "Lloegr",
        english: "England",
        pronunciation: "HLOY-gr",
        difficulty: "Beginner",
        category: "Places",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 31,
        welsh: "Ysgol",
        english: "School",
        pronunciation: "UH-sgol",
        difficulty: "Beginner",
        category: "Places",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 32,
        welsh: "Tŷ",
        english: "House",
        pronunciation: "tee",
        difficulty: "Beginner",
        category: "Places",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 33,
        welsh: "Dref",
        english: "Town",
        pronunciation: "drev",
        difficulty: "Beginner",
        category: "Places",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 34,
        welsh: "Parc",
        english: "Park",
        pronunciation: "park",
        difficulty: "Beginner",
        category: "Places",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 35,
        welsh: "Siop",
        english: "Shop",
        pronunciation: "shop",
        difficulty: "Beginner",
        category: "Places",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },

      // Colors
      {
        id: 36,
        welsh: "Coch",
        english: "Red",
        pronunciation: "kokh",
        difficulty: "Beginner",
        category: "Colors",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 37,
        welsh: "Glas",
        english: "Blue",
        pronunciation: "glas",
        difficulty: "Beginner",
        category: "Colors",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 38,
        welsh: "Gwyrdd",
        english: "Green",
        pronunciation: "goo-eerth",
        difficulty: "Beginner",
        category: "Colors",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 39,
        welsh: "Melyn",
        english: "Yellow",
        pronunciation: "MEH-lin",
        difficulty: "Beginner",
        category: "Colors",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 40,
        welsh: "Du",
        english: "Black",
        pronunciation: "dee",
        difficulty: "Beginner",
        category: "Colors",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
      {
        id: 41,
        welsh: "Gwyn",
        english: "White",
        pronunciation: "gwin",
        difficulty: "Beginner",
        category: "Colors",
        points: 0,
        mastered: false,
        reviewCount: 0,
      },
    ]
  }

  getStoredProgress(): Record<number, VocabularyCard> {
    if (typeof window === "undefined") return {}
    const stored = localStorage.getItem(this.storageKey)
    return stored ? JSON.parse(stored) : {}
  }

  getUserProgress(): UserProgress {
    if (typeof window === "undefined") return { totalPoints: 0, masteredCards: 0, reviewedToday: 0 }
    const stored = localStorage.getItem(this.userProgressKey)
    return stored ? JSON.parse(stored) : { totalPoints: 0, masteredCards: 0, reviewedToday: 0 }
  }

  saveProgress(cardId: number, points: number, mastered: boolean, reviewCount: number) {
    if (typeof window === "undefined") return

    const progress = this.getStoredProgress()
    const userProgress = this.getUserProgress()

    progress[cardId] = {
      ...this.getVocabularyData().find((card) => card.id === cardId)!,
      points,
      mastered,
      reviewCount,
      lastReviewed: new Date(),
    }

    userProgress.totalPoints += 10
    if (mastered && !progress[cardId]?.mastered) {
      userProgress.masteredCards += 1
    }
    userProgress.reviewedToday += 1

    localStorage.setItem(this.storageKey, JSON.stringify(progress))
    localStorage.setItem(this.userProgressKey, JSON.stringify(userProgress))
  }

  getVocabularyWithProgress(): VocabularyCard[] {
    const baseData = this.getVocabularyData()
    const progress = this.getStoredProgress()

    return baseData.map((card) => ({
      ...card,
      ...progress[card.id],
    }))
  }

  getCategories(): string[] {
    const data = this.getVocabularyData()
    return [...new Set(data.map((card) => card.category))].sort()
  }

  getDeckForCategory(category: string): VocabularyCard[] {
    const cards = this.getVocabularyWithProgress()
    const categoryCards = category === "All" ? cards : cards.filter((card) => card.category === category)

    // Prioritize non-mastered cards, but include mastered cards less frequently
    const nonMastered = categoryCards.filter((card) => !card.mastered)
    const mastered = categoryCards.filter((card) => card.mastered)

    // Include 1 mastered card for every 4 non-mastered cards
    const deck = [...nonMastered]
    mastered.forEach((card, index) => {
      if (index % 4 === 0) deck.push(card)
    })

    // Shuffle the deck
    return deck.sort(() => Math.random() - 0.5)
  }
}

export const vocabularyService = new VocabularyService()
