"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Award,
  Filter,
  Volume2,
  ArrowRight,
  Trophy,
  Target,
  Loader2,
} from "lucide-react"
import { lessonService, type Lesson, type UserProfile, type UserLessonProgress } from "@/lib/lesson-service"
import { useAuth } from "@/contexts/auth-context"
import { ttsService } from "@/lib/text-to-speech"

export default function LessonView() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<Array<Lesson & { progress?: UserLessonProgress }>>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [showLessonDetail, setShowLessonDetail] = useState(false)

  useEffect(() => {
    if (user) {
      loadLessonsAndProfile()
    }
  }, [user])

  const loadLessonsAndProfile = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load user profile first
      let profile = await lessonService.getUserProfile(user.uid)
      if (!profile) {
        await lessonService.createUserProfile(user.uid)
        profile = await lessonService.getUserProfile(user.uid)
      }
      setUserProfile(profile)

      // Load lessons with progress
      const lessonsWithProgress = await lessonService.getUserLessonsWithProgress(user.uid)
      setLessons(lessonsWithProgress)

      // Load categories
      const availableCategories = await lessonService.getCategories()
      setCategories(availableCategories)
    } catch (error) {
      console.error("Failed to load lessons and profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const startLesson = async (lesson: Lesson) => {
    if (!user || !lesson.id || !userProfile) return

    // Check if user can access this lesson based on proficiency
    const proficiencyOrder = ["Beginner", "Intermediate", "Advanced"]
    const userLevel = proficiencyOrder.indexOf(userProfile.proficiency)
    const lessonLevel = proficiencyOrder.indexOf(lesson.requiredProficiency)

    if (userLevel < lessonLevel) {
      // User doesn't have sufficient proficiency level
      return
    }

    try {
      await lessonService.startLesson(user.uid, lesson.id)
      setSelectedLesson(lesson)
      setShowLessonDetail(true)
    } catch (error) {
      console.error("Failed to start lesson:", error)
    }
  }

  const playAudio = async (text: string, speed = 1.0) => {
    try {
      const audioContent = await ttsService.synthesizeSpeech({
        text,
        languageCode: "cy-GB",
        speed,
      })
      await ttsService.playAudio(audioContent)
    } catch (error) {
      console.error("Failed to play audio:", error)
    }
  }

  const filteredLessons = lessons.filter((lesson) => {
    const categoryMatch = selectedCategory === "all" || lesson.category === selectedCategory
    const difficultyMatch = selectedDifficulty === "all" || lesson.difficulty === selectedDifficulty
    return categoryMatch && difficultyMatch
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case "Beginner":
        return "text-green-600"
      case "Intermediate":
        return "text-yellow-600"
      case "Advanced":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getNextProficiencyThreshold = (currentProficiency: string, currentPoints: number) => {
    switch (currentProficiency) {
      case "Beginner":
        return { next: "Intermediate", threshold: 1000, current: currentPoints }
      case "Intermediate":
        return { next: "Advanced", threshold: 2500, current: currentPoints }
      case "Advanced":
        return { next: "Master", threshold: 5000, current: currentPoints }
      default:
        return { next: "Intermediate", threshold: 1000, current: currentPoints }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading lessons...</p>
        </div>
      </div>
    )
  }

  if (showLessonDetail && selectedLesson) {
    return (
      <LessonDetail
        lesson={selectedLesson}
        onBack={() => {
          setShowLessonDetail(false)
          setSelectedLesson(null)
          loadLessonsAndProfile() // Refresh data
        }}
        playAudio={playAudio}
        user={user!}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* User Progress Header */}
      {userProfile && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Your Progress
                </CardTitle>
                <CardDescription>
                  Current Level:{" "}
                  <span className={`font-semibold ${getProficiencyColor(userProfile.proficiency)}`}>
                    {userProfile.proficiency}
                  </span>
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{userProfile.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-lg font-semibold">{userProfile.completedLessons.length}</div>
                <div className="text-sm text-muted-foreground">Lessons Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{userProfile.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{userProfile.longestStreak}</div>
                <div className="text-sm text-muted-foreground">Longest Streak</div>
              </div>
            </div>

            {/* Progress to next level */}
            {userProfile.proficiency !== "Advanced" && (
              <div className="mt-4">
                {(() => {
                  const { next, threshold, current } = getNextProficiencyThreshold(
                    userProfile.proficiency,
                    userProfile.totalPoints,
                  )
                  const progress = Math.min((current / threshold) * 100, 100)
                  return (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to {next}</span>
                        <span>
                          {current} / {threshold} points
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="h-5 w-5" />
              <span className="font-semibold">Filter Lessons</span>
            </div>
            <div className="flex gap-4 flex-1">
              <div className="flex-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLessons.map((lesson) => {
          const isCompleted = lesson.progress?.completed || false
          const progressPercent = lesson.progress?.progress || 0
          const canAccess = userProfile
            ? (() => {
                const proficiencyOrder = ["Beginner", "Intermediate", "Advanced"]
                const userLevel = proficiencyOrder.indexOf(userProfile.proficiency)
                const lessonLevel = proficiencyOrder.indexOf(lesson.requiredProficiency)
                return userLevel >= lessonLevel
              })()
            : false

          return (
            <Card key={lesson.id} className={`hover:shadow-md transition-shadow ${!canAccess ? "opacity-60" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-blue-100 text-blue-800">{lesson.category}</Badge>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(lesson.difficulty)}>{lesson.difficulty}</Badge>
                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
                <CardTitle className="text-lg">{lesson.title}</CardTitle>
                <CardDescription className="line-clamp-2">{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  {lesson.progress && progressPercent > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.estimatedDuration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {lesson.pointsReward} pts
                      </span>
                    </div>
                    <span>{lesson.content?.length || 0} sections</span>
                  </div>

                  <div className="text-xs text-muted-foreground">Requires: {lesson.requiredProficiency} level</div>

                  <Button
                    className="w-full"
                    onClick={() => startLesson(lesson)}
                    disabled={!canAccess}
                    variant={isCompleted ? "outline" : "default"}
                  >
                    {!canAccess ? (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Locked
                      </>
                    ) : isCompleted ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review
                      </>
                    ) : lesson.progress ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Continue
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Lesson
                      </>
                    )}
                  </Button>

                  {lesson.tags && lesson.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {lesson.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {lesson.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{lesson.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredLessons.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <div className="text-gray-500 mb-2">No lessons found</div>
            <p className="text-sm text-gray-400">
              {selectedCategory !== "all" || selectedDifficulty !== "all"
                ? "Try adjusting your filters"
                : "Check back later for new lessons"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Audio Control Component
interface AudioControlsProps {
  text: string
  playAudio: (text: string, speed: number) => void
  size?: "sm" | "default"
}

function AudioControls({ text, playAudio, size = "default" }: AudioControlsProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"
  const buttonSize = size === "sm" ? "sm" : "sm"

  return (
    <div className="flex items-center gap-2">
      <Volume2 className={`${iconSize} text-gray-600`} />
      <div className="flex gap-1">
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => playAudio(text, 1.0)}
          className="px-2 py-1 text-xs h-auto"
        >
          Normal
        </Button>
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => playAudio(text, 0.7)}
          className="px-2 py-1 text-xs h-auto"
        >
          Slow
        </Button>
      </div>
    </div>
  )
}

// Lesson Detail Component
interface LessonDetailProps {
  lesson: Lesson
  onBack: () => void
  playAudio: (text: string, speed?: number) => void
  user: any
}

function LessonDetail({ lesson, onBack, playAudio, user }: LessonDetailProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [progress, setProgress] = useState<UserLessonProgress | null>(null)
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, string>>({})
  const [exerciseResults, setExerciseResults] = useState<Record<number, { correct: boolean; answered: boolean }>>({})

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    if (!lesson.id) return

    try {
      const userProgress = await lessonService.getUserLessonProgress(user.uid, lesson.id)
      if (userProgress) {
        setProgress(userProgress)
        setCurrentSection(userProgress.currentSection)
      }
    } catch (error) {
      console.error("Failed to load progress:", error)
    }
  }

  const updateProgress = async (sectionIndex: number, completed = false) => {
    if (!lesson.id) return

    try {
      const progressPercent = ((sectionIndex + 1) / lesson.content.length) * 100
      const progressData: UserLessonProgress = {
        ...progress,
        userId: user.uid,
        lessonId: lesson.id,
        currentSection: sectionIndex,
        progress: progressPercent,
        completed: completed && sectionIndex === lesson.content.length - 1,
        pointsEarned: completed && sectionIndex === lesson.content.length - 1 ? lesson.pointsReward : 0,
        timeSpent: (progress?.timeSpent || 0) + 1,
        startedAt: progress?.startedAt || new Date(),
        lastAccessedAt: new Date(),
      }

      await lessonService.updateUserLessonProgress(progressData)
      setProgress(progressData)
    } catch (error) {
      console.error("Failed to update progress:", error)
    }
  }

  const handleExerciseAnswer = (exerciseIndex: number, selectedAnswer: string, correctAnswer: string) => {
    const isCorrect = selectedAnswer === correctAnswer

    setExerciseAnswers((prev) => ({
      ...prev,
      [exerciseIndex]: selectedAnswer,
    }))

    setExerciseResults((prev) => ({
      ...prev,
      [exerciseIndex]: {
        correct: isCorrect,
        answered: true,
      },
    }))
  }

  const getOptionButtonClass = (exerciseIndex: number, option: string, correctAnswer: string) => {
    const result = exerciseResults[exerciseIndex]
    const selectedAnswer = exerciseAnswers[exerciseIndex]

    if (!result?.answered) {
      return "justify-start text-left bg-transparent hover:bg-gray-50"
    }

    // If this option is the selected answer
    if (option === selectedAnswer) {
      return result.correct
        ? "justify-start text-left bg-green-100 text-green-800 border-green-300"
        : "justify-start text-left bg-red-100 text-red-800 border-red-300"
    }

    // If this option is the correct answer and user selected wrong
    if (option === correctAnswer && !result.correct) {
      return "justify-start text-left bg-green-100 text-green-800 border-green-300"
    }

    // All other options when answered
    return "justify-start text-left bg-gray-50 text-gray-500 opacity-60"
  }

  const nextSection = () => {
    if (currentSection < lesson.content.length - 1) {
      const nextIndex = currentSection + 1
      setCurrentSection(nextIndex)
      updateProgress(nextIndex)
      // Reset exercise state for new section
      setExerciseAnswers({})
      setExerciseResults({})
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      // Reset exercise state for previous section
      setExerciseAnswers({})
      setExerciseResults({})
    }
  }

  const completeLesson = () => {
    updateProgress(currentSection, true)
    onBack()
  }

  const currentContent = lesson.content[currentSection]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back to Lessons
        </Button>
        <div className="text-sm text-muted-foreground">
          Section {currentSection + 1} of {lesson.content.length}
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>{lesson.title}</CardTitle>
          <CardDescription>{lesson.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(((currentSection + 1) / lesson.content.length) * 100)}%</span>
            </div>
            <Progress value={((currentSection + 1) / lesson.content.length) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {currentContent.title}
            <Badge className={getDifficultyColor(currentContent.type)}>{currentContent.type}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <p>{currentContent.content}</p>
          </div>

          {/* Vocabulary Section */}
          {currentContent.type === "vocabulary" && currentContent.welsh && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Welsh</h4>
                  <AudioControls text={currentContent.welsh} playAudio={playAudio} />
                </div>
                <p className="text-lg">{currentContent.welsh}</p>
                {currentContent.pronunciation && (
                  <p className="text-sm text-muted-foreground mt-1">Pronunciation: {currentContent.pronunciation}</p>
                )}
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold mb-2">English</h4>
                <p className="text-lg">{currentContent.english}</p>
              </Card>
            </div>
          )}

          {/* Examples */}
          {currentContent.examples && currentContent.examples.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Examples</h4>
              <div className="space-y-3">
                {currentContent.examples.map((example, index) => (
                  <Card key={index} className="p-3">
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{example.welsh}</span>
                        <AudioControls text={example.welsh} playAudio={playAudio} size="sm" />
                      </div>
                      <span className="text-muted-foreground">{example.english}</span>
                      {example.pronunciation && (
                        <span className="text-xs text-muted-foreground col-span-2">
                          Pronunciation: {example.pronunciation}
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Section */}
          {currentContent.type === "conversation" && currentContent.dialogue && (
            <div>
              <h4 className="font-semibold mb-3">Conversation</h4>
              <div className="space-y-3">
                {currentContent.dialogue.map((line, index) => (
                  <Card key={index} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-600">{line.speaker}</span>
                        <AudioControls text={line.welsh} playAudio={playAudio} size="sm" />
                      </div>
                      <div className="grid gap-1">
                        <p className="font-medium">{line.welsh}</p>
                        <p className="text-muted-foreground">{line.english}</p>
                        {line.pronunciation && (
                          <p className="text-xs text-muted-foreground">Pronunciation: {line.pronunciation}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Exercise Section */}
          {currentContent.type === "exercise" && currentContent.exercises && (
            <div>
              <h4 className="font-semibold mb-3">Exercises</h4>
              <div className="space-y-4">
                {currentContent.exercises.map((exercise, index) => {
                  const result = exerciseResults[index]
                  const selectedAnswer = exerciseAnswers[index]

                  return (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <h5 className="font-medium">{exercise.question}</h5>
                        <div className="grid gap-2">
                          {exercise.options.map((option, optIndex) => (
                            <Button
                              key={optIndex}
                              variant="outline"
                              className={getOptionButtonClass(index, option, exercise.correctAnswer)}
                              onClick={() => {
                                if (!result?.answered) {
                                  handleExerciseAnswer(index, option, exercise.correctAnswer)
                                }
                              }}
                              disabled={result?.answered}
                            >
                              {option}
                            </Button>
                          ))}
                        </div>

                        {/* Show answer and explanation only after user answers */}
                        {result?.answered && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
                            <div className="text-sm">
                              <strong>Answer:</strong> {exercise.correctAnswer}
                            </div>
                            <div className="text-sm">
                              <strong>Explanation:</strong> {exercise.explanation}
                            </div>
                            {exercise.pronunciation && (
                              <div className="text-sm text-muted-foreground">
                                <strong>Pronunciation:</strong> {exercise.pronunciation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevSection} disabled={currentSection === 0}>
          Previous
        </Button>

        {currentSection === lesson.content.length - 1 ? (
          <Button onClick={completeLesson} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Lesson
          </Button>
        ) : (
          <Button onClick={nextSection}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-800"
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800"
    case "Advanced":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
