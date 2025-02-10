export interface SoilType {
  id: string
  code: string
  description_pt: string
  description_en: string
  description_es: string
  registrationDate: string
  userId: string
}

export interface SoilTypeResponse {
  success: boolean
  data: SoilType
  message?: string
}

export interface SoilTypesResponse {
  success: boolean
  data: SoilType[]
  message?: string
}

