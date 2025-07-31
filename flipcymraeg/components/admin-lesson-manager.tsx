"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen, Save, X, Volume2, Loader2 } from "lucide-react"
import { lessonService, type Lesson, type LessonContent } from "@/lib/lesson-service"
import { useAuth } from "@/contexts/auth-context"
import { ttsService } from "@/lib/text-to-speech"

export default function AdminLessonManager() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [formData, setFormData] = useState<Partial<Lesson>>({
    title: "",
    description: "",
    category: "",
    difficulty: "Beginner",
    requiredProficiency: "Beginner",
    pointsReward: 25,
    estimatedDuration: 20,
    content: [],
    published: false,
    tags: [],
  })

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      setLoading(true)
      const allLessons = await lessonService.getAllLessons()
      setLessons(allLessons)
    } catch (error) {
      console.error("Failed to load lessons:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLesson = async () => {
    if (!user || !formData.title || !formData.description) return

    try {
      const lessonData = {
        ...formData,
        createdBy: user.uid,
        content: formData.content || [],
        tags: formData.tags || [],
      } as Omit<Lesson, "id" | "createdAt" | "updatedAt">

      await lessonService.createLesson(lessonData)
      await loadLessons()
      setShowCreateDialog(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create lesson:", error)
    }
  }

  const handleUpdateLesson = async () => {
    if (!selectedLesson?.id || !formData.title || !formData.description) return

    try {
      await lessonService.updateLesson(selectedLesson.id, formData)
      await loadLessons()
      setShowEditDialog(false)
      setSelectedLesson(null)
      resetForm()
    } catch (error) {
      console.error("Failed to update lesson:", error)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    try {
      await lessonService.deleteLesson(lessonId)
      await loadLessons()
    } catch (error) {
      console.error("Failed to delete lesson:", error)
    }
  }

  const handleTogglePublished = async (lesson: Lesson) => {
    if (!lesson.id) return

    try {
      await lessonService.updateLesson(lesson.id, {
        published: !lesson.published,
      })
      await loadLessons()
    } catch (error) {
      console.error("Failed to toggle lesson publication:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      difficulty: "Beginner",
      requiredProficiency: "Beginner",
      pointsReward: 25,
      estimatedDuration: 20,
      content: [],
      published: false,
      tags: [],
    })
  }

  const openEditDialog = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setFormData({
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      difficulty: lesson.difficulty,
      requiredProficiency: lesson.requiredProficiency,
      pointsReward: lesson.pointsReward,
      estimatedDuration: lesson.estimatedDuration,
      content: lesson.content,
      published: lesson.published,
      tags: lesson.tags,
    })
    setShowEditDialog(true)
  }

  const addContentSection = () => {
    const newSection: LessonContent = {
      type: "vocabulary",
      title: "",
      content: "",
      welsh: "",
      english: "",
      pronunciation: "",
      examples: [],
    }
    setFormData({
      ...formData,
      content: [...(formData.content || []), newSection],
    })
  }

  const updateContentSection = (index: number, updates: Partial<LessonContent>) => {
    const updatedContent = [...(formData.content || [])]
    updatedContent[index] = { ...updatedContent[index], ...updates }
    setFormData({ ...formData, content: updatedContent })
  }

  const removeContentSection = (index: number) => {
    const updatedContent = [...(formData.content || [])]
    updatedContent.splice(index, 1)
    setFormData({ ...formData, content: updatedContent })
  }

  const playAudio = async (text: string) => {
    try {
      const audioContent = await ttsService.synthesizeSpeech({
        text,
        languageCode: "cy-GB",
        speed: 1.0,
      })
      await ttsService.playAudio(audioContent)
    } catch (error) {
      console.error("Failed to play audio:", error)
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Lesson Management</h3>
          <p className="text-sm text-muted-foreground">Create and manage Welsh lessons for your students</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lesson</DialogTitle>
              <DialogDescription>Create a new Welsh lesson with content sections</DialogDescription>
            </DialogHeader>
            <LessonForm
              formData={formData}
              setFormData={setFormData}
              onSave={handleCreateLesson}
              onCancel={() => {
                setShowCreateDialog(false)
                resetForm()
              }}
              addContentSection={addContentSection}
              updateContentSection={updateContentSection}
              removeContentSection={removeContentSection}
              playAudio={playAudio}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-blue-100 text-blue-800">{lesson.category}</Badge>
                <div className="flex items-center space-x-2">
                  <Badge className={getDifficultyColor(lesson.difficulty)}>{lesson.difficulty}</Badge>
                  {lesson.published ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              <CardTitle className="text-lg">{lesson.title}</CardTitle>
              <CardDescription className="line-clamp-2">{lesson.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{lesson.estimatedDuration} min</span>
                  <span>{lesson.pointsReward} pts</span>
                  <span>{lesson.content.length} sections</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Requires: {lesson.requiredProficiency}</div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleTogglePublished(lesson)}>
                      {lesson.published ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(lesson)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => lesson.id && handleDeleteLesson(lesson.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {lesson.tags.length > 0 && (
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
        ))}
      </div>

      {lessons.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <div className="text-gray-500 mb-4">No lessons created yet</div>
            <p className="text-sm text-gray-400 mb-4">Create your first Welsh lesson to get started</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Lesson
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>Update lesson content and settings</DialogDescription>
          </DialogHeader>
          <LessonForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleUpdateLesson}
            onCancel={() => {
              setShowEditDialog(false)
              setSelectedLesson(null)
              resetForm()
            }}
            addContentSection={addContentSection}
            updateContentSection={updateContentSection}
            removeContentSection={removeContentSection}
            playAudio={playAudio}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Lesson Form Component
interface LessonFormProps {
  formData: Partial<Lesson>
  setFormData: (data: Partial<Lesson>) => void
  onSave: () => void
  onCancel: () => void
  addContentSection: () => void
  updateContentSection: (index: number, updates: Partial<LessonContent>) => void
  removeContentSection: (index: number) => void
  playAudio: (text: string) => void
}

function LessonForm({
  formData,
  setFormData,
  onSave,
  onCancel,
  addContentSection,
  updateContentSection,
  removeContentSection,
  playAudio,
}: LessonFormProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Lesson title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Greetings, Numbers, Colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Lesson description"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty || "Beginner"}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredProficiency">Required Level</Label>
              <Select
                value={formData.requiredProficiency || "Beginner"}
                onValueChange={(value) => setFormData({ ...formData, requiredProficiency: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pointsReward">Points Reward</Label>
              <Input
                id="pointsReward"
                type="number"
                value={formData.pointsReward || 25}
                onChange={(e) => setFormData({ ...formData, pointsReward: Number.parseInt(e.target.value) })}
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Duration (minutes)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                value={formData.estimatedDuration || 20}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: Number.parseInt(e.target.value) })}
                min="1"
                max="120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="beginner, vocabulary, greetings"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published || false}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="published">Publish lesson (make visible to students)</Label>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Lesson Content</h4>
            <Button onClick={addContentSection} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          <div className="space-y-4">
            {formData.content?.map((section, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium">Section {index + 1}</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeContentSection(index)}
                      className="text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Section Type</Label>
                      <Select
                        value={section.type}
                        onValueChange={(value) => updateContentSection(index, { type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vocabulary">Vocabulary</SelectItem>
                          <SelectItem value="grammar">Grammar</SelectItem>
                          <SelectItem value="conversation">Conversation</SelectItem>
                          <SelectItem value="exercise">Exercise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Section Title</Label>
                      <Input
                        value={section.title}
                        onChange={(e) => updateContentSection(index, { title: e.target.value })}
                        placeholder="Section title"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Content Description</Label>
                    <Textarea
                      value={section.content}
                      onChange={(e) => updateContentSection(index, { content: e.target.value })}
                      placeholder="Section content description"
                      rows={3}
                    />
                  </div>

                  {/* Vocabulary Section Fields */}
                  {section.type === "vocabulary" && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Label>Welsh Word/Phrase</Label>
                            {section.welsh && (
                              <Button variant="ghost" size="sm" onClick={() => playAudio(section.welsh!)}>
                                <Volume2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <Input
                            value={section.welsh || ""}
                            onChange={(e) => updateContentSection(index, { welsh: e.target.value })}
                            placeholder="Welsh text"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>English Translation</Label>
                          <Input
                            value={section.english || ""}
                            onChange={(e) => updateContentSection(index, { english: e.target.value })}
                            placeholder="English translation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pronunciation Guide</Label>
                          <Input
                            value={section.pronunciation || ""}
                            onChange={(e) => updateContentSection(index, { pronunciation: e.target.value })}
                            placeholder="Pronunciation guide"
                          />
                        </div>
                      </div>

                      {/* Examples */}
                      <div className="space-y-2">
                        <Label>Examples</Label>
                        <div className="space-y-2">
                          {section.examples?.map((example, exIndex) => (
                            <div key={exIndex} className="grid gap-2 md:grid-cols-3 p-2 border rounded">
                              <Input
                                value={example.welsh}
                                onChange={(e) => {
                                  const newExamples = [...(section.examples || [])]
                                  newExamples[exIndex] = { ...example, welsh: e.target.value }
                                  updateContentSection(index, { examples: newExamples })
                                }}
                                placeholder="Welsh example"
                              />
                              <Input
                                value={example.english}
                                onChange={(e) => {
                                  const newExamples = [...(section.examples || [])]
                                  newExamples[exIndex] = { ...example, english: e.target.value }
                                  updateContentSection(index, { examples: newExamples })
                                }}
                                placeholder="English translation"
                              />
                              <div className="flex gap-2">
                                <Input
                                  value={example.pronunciation || ""}
                                  onChange={(e) => {
                                    const newExamples = [...(section.examples || [])]
                                    newExamples[exIndex] = { ...example, pronunciation: e.target.value }
                                    updateContentSection(index, { examples: newExamples })
                                  }}
                                  placeholder="Pronunciation"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newExamples = [...(section.examples || [])]
                                    newExamples.splice(exIndex, 1)
                                    updateContentSection(index, { examples: newExamples })
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newExamples = [
                                ...(section.examples || []),
                                { welsh: "", english: "", pronunciation: "" },
                              ]
                              updateContentSection(index, { examples: newExamples })
                            }}
                          >
                            Add Example
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exercise Section Fields */}
                  {section.type === "exercise" && (
                    <div className="space-y-4">
                      <Label>Exercises</Label>
                      <div className="space-y-4">
                        {section.exercises?.map((exercise, exIndex) => (
                          <Card key={exIndex} className="p-3">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Label>Exercise {exIndex + 1}</Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newExercises = [...(section.exercises || [])]
                                    newExercises.splice(exIndex, 1)
                                    updateContentSection(index, { exercises: newExercises })
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <Input
                                value={exercise.question}
                                onChange={(e) => {
                                  const newExercises = [...(section.exercises || [])]
                                  newExercises[exIndex] = { ...exercise, question: e.target.value }
                                  updateContentSection(index, { exercises: newExercises })
                                }}
                                placeholder="Question"
                              />
                              <div className="space-y-2">
                                <Label>Options</Label>
                                {exercise.options?.map((option, optIndex) => (
                                  <div key={optIndex} className="flex gap-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const newExercises = [...(section.exercises || [])]
                                        const newOptions = [...(exercise.options || [])]
                                        newOptions[optIndex] = e.target.value
                                        newExercises[exIndex] = { ...exercise, options: newOptions }
                                        updateContentSection(index, { exercises: newExercises })
                                      }}
                                      placeholder={`Option ${optIndex + 1}`}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newExercises = [...(section.exercises || [])]
                                        const newOptions = [...(exercise.options || [])]
                                        newOptions.splice(optIndex, 1)
                                        newExercises[exIndex] = { ...exercise, options: newOptions }
                                        updateContentSection(index, { exercises: newExercises })
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newExercises = [...(section.exercises || [])]
                                    const newOptions = [...(exercise.options || []), ""]
                                    newExercises[exIndex] = { ...exercise, options: newOptions }
                                    updateContentSection(index, { exercises: newExercises })
                                  }}
                                >
                                  Add Option
                                </Button>
                              </div>
                              <Input
                                value={exercise.correctAnswer}
                                onChange={(e) => {
                                  const newExercises = [...(section.exercises || [])]
                                  newExercises[exIndex] = { ...exercise, correctAnswer: e.target.value }
                                  updateContentSection(index, { exercises: newExercises })
                                }}
                                placeholder="Correct answer"
                              />
                              <Textarea
                                value={exercise.explanation || ""}
                                onChange={(e) => {
                                  const newExercises = [...(section.exercises || [])]
                                  newExercises[exIndex] = { ...exercise, explanation: e.target.value }
                                  updateContentSection(index, { exercises: newExercises })
                                }}
                                placeholder="Explanation"
                                rows={2}
                              />
                              <Input
                                value={exercise.pronunciation || ""}
                                onChange={(e) => {
                                  const newExercises = [...(section.exercises || [])]
                                  newExercises[exIndex] = { ...exercise, pronunciation: e.target.value }
                                  updateContentSection(index, { exercises: newExercises })
                                }}
                                placeholder="Pronunciation guide (optional)"
                              />
                            </div>
                          </Card>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newExercises = [
                              ...(section.exercises || []),
                              {
                                question: "",
                                options: [""],
                                correctAnswer: "",
                                explanation: "",
                                pronunciation: "",
                              },
                            ]
                            updateContentSection(index, { exercises: newExercises })
                          }}
                        >
                          Add Exercise
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {(!formData.content || formData.content.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No content sections yet</p>
              <p className="text-sm">Add sections to build your lesson</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Lesson
        </Button>
      </div>
    </div>
  )
}
