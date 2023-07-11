export interface UserData {
    id: string;
    username: string,
    email: string,
    bio: string,
    image? : string;
    token: string;
}

export interface UserRO {
    user: UserData
}