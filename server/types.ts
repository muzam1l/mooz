export interface IPerson {
    userId: string
}

export interface IRoom {
    id: string
    created_by?: string
    name: string
    opts?: {
        capacity?: number
    }
}

export type IServerRoom = {
    userIds: string[]
} & IRoom

type Ev<T extends object = object> = (
    opts: T,
    cb?: (arg0: { error: string | null }) => void,
) => void

export interface IServerToClientEvent<T = unknown> {
    'action:room_connection_established': Ev<{ room: IRoom }>
    'action:room_connection_terminated': Ev<{ roomId: string }>

    'action:establish_peer_connection': Ev<{ userName: string; userId: string }>
    'action:terminate_peer_connection': Ev<{ userId: string }>

    'action:message_received': Ev<{ from: string; data: T }>
}

export interface IClientToServerEvent<T = unknown> {
    'request:register_self': Ev<{ userId: string; currendRoomId?: string }>

    'request:create_room': Ev<{ room: IRoom }>
    'request:join_room': Ev<{ userName: string; roomId: string }>
    'request:leave_room': Ev<{ roomId: string }>

    'request:send_mesage': Ev<{ to: string; data: T }>
    'request:report_person_left': Ev<{ userId: string; roomId: string }>
}