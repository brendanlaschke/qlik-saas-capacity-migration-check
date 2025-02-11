export type Connection = {
    tenantUrl: string;
    apiKey: string;
    next?: string;
};

export async function POST(request: Request) {
    try {
        const con: Connection = await request.json();

        if (!con.tenantUrl || !con.apiKey) {
            return new Response('Missing tenantUrl or apiKey', { status: 400 });
        }

        const {data: spaces, next} = await getSpaces(con);

        const spacesWithSize: SpaceWithSize[] = [];

        for (const space of spaces) {
            const connectionId = await getSpaceDataConnectionId(con, space.id);

            const spaceFiles = await getSpaceDataFiles(con, connectionId);

            spacesWithSize.push({
                id: space.id,
                name: space.name,
                files: spaceFiles,
                size: spaceFiles.reduce((acc, file) => acc + file.size, 0),
            });
        }
        return Response.json({data: spacesWithSize, next});
    } catch (err) {
        console.error(err);
        return new Response('Failed to get Info', { status: 500 });
    }
}

type Space = {
    id: string;
    name: string;
};
export type SpaceWithSize = {
    id: string;
    name: string;
    files: SpaceFile[];
    size: number;
};
type SpaceFile = {
    name: string;
    id: string;
    size: number;
};

async function getSpaces(
    con: Connection
): Promise<{ data: Space[]; next: string }> {
    const url = con.next ?? (con.tenantUrl + '/api/v1/spaces?limit=5');
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${con.apiKey}`,
        },
    });
    const json = await res.json();

    return {
        data: json.data.map((x) => ({ id: x.id, name: x.name })) as Space[],
        next: json.links?.next?.href,
    };
}
async function getSpaceDataConnectionId(
    con: Connection,
    spaceId: string
): Promise<string> {
    const res = await fetch(
        con.tenantUrl + `/api/v1/data-connections?limit=2&spaceId=${spaceId}`,
        {
            headers: {
                Authorization: `Bearer ${con.apiKey}`,
            },
        }
    );
    const json = await res.json();

    return json.data[0].id;
}
async function getSpaceDataFiles(con: Connection, connectionId: string) {
    const spaceFiles: SpaceFile[] = [];
    let next =
        con.tenantUrl +
        `/api/v1/data-files?connectionId=${connectionId}&limit=500&includeFolderStats=true`;
    while (next != null) {
        const res = await fetch(next, {
            headers: {
                Authorization: `Bearer ${con.apiKey}`,
            },
        });
        const json = await res.json();
        if (!json.data) {
            break;
        }
        spaceFiles.push(...json.data);
        next = json.links?.next?.href;
    }

    return spaceFiles.map((x) => ({
        name: x.name,
        id: x.id,
        size: x.size,
    })) as SpaceFile[];
}
