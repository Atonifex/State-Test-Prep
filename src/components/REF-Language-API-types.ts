/*export type AssessmentType = "speak" | "write" | "puzzle" | "vocabulary" | "grammar" | "comprehension"

export type CEFR = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

export type AssessRequest = {
	type: AssessmentType
	text: string
	tags?: string[]
	level?: CEFR
	locale?: string
	attempt: number
	maxAttempts: number
	successThreshold?: number
	instructions?: string
	context?: {
		storyId?: string
		sceneId?: string
		personaId?: string
	}
}

export type AssessResponse = {
	ok: boolean
	score: number
	feedback: string
	correct: string
	incorrect?: string
	rule?: string
	retry_prompt?: string
	attemptsRemaining: number
	next_hint?: string
	type: AssessmentType
	level?: CEFR
} */