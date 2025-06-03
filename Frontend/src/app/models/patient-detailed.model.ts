export interface PatientDetailed {
    id: number,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string,
    healthInsuranceNumber: number,
    age: number,
    gender: string,
    history: string,
    prescriptions: string[]
}