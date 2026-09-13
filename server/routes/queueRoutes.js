const express = require('express')

const QueueSession =
    require('../models/queueSession')

const QueueMatch =
    require('../models/queueMatch')

const authMiddleware =
    require('../middleware/authMiddleware')

const restrictionMiddleware =
    require('../middleware/restrictionMiddleware')

const router = express.Router()

// ==========================
// PLAYER ID HELPER
// ==========================

const getPlayerId = (player) => {

    if (!player) {
        return ''
    }

    if (player._id) {
        return player._id.toString()
    }

    return player.toString()

}


// ==========================
// PAIR KEY
// ==========================

const getPairKey = (
    playerA,
    playerB
) => {

    return [
        getPlayerId(playerA),
        getPlayerId(playerB)
    ]
        .sort()
        .join('-')

}


// ==========================
// INCREMENT MAP
// ==========================

const incrementMap = (
    map,
    key
) => {

    map.set(
        key,
        (map.get(key) || 0) + 1
    )

}


// ==========================
// BUILD MATCH HISTORY
// ==========================

const buildMatchHistory = (
    matches,
    gameType
) => {

    const matchCounts =
        new Map()

    const teammateCounts =
        new Map()

    const opponentCounts =
        new Map()


    matches.forEach(match => {

        const players =
            match.players
                ?.map(getPlayerId)
                .filter(Boolean) || []


        // ==========================
        // MATCH COUNT
        // ==========================

        players.forEach(playerId => {

            incrementMap(
                matchCounts,
                playerId
            )

        })


        // ==========================
        // SINGLES HISTORY
        // ==========================

        if (
            gameType === 'Singles' &&
            players.length >= 2
        ) {

            incrementMap(
                opponentCounts,
                getPairKey(
                    players[0],
                    players[1]
                )
            )

        }


        // ==========================
        // DOUBLES HISTORY
        // ==========================

        if (
            gameType === 'Doubles' &&
            players.length >= 4
        ) {

            // Team 1
            // players[0] + players[1]

            incrementMap(
                teammateCounts,
                getPairKey(
                    players[0],
                    players[1]
                )
            )


            // Team 2
            // players[2] + players[3]

            incrementMap(
                teammateCounts,
                getPairKey(
                    players[2],
                    players[3]
                )
            )


            // Opponents

            const opponentPairs = [

                [
                    players[0],
                    players[2]
                ],

                [
                    players[0],
                    players[3]
                ],

                [
                    players[1],
                    players[2]
                ],

                [
                    players[1],
                    players[3]
                ]

            ]


            opponentPairs.forEach(
                pair => {

                    incrementMap(
                        opponentCounts,
                        getPairKey(
                            pair[0],
                            pair[1]
                        )
                    )

                }
            )

        }

    })


    return {

        matchCounts,

        teammateCounts,

        opponentCounts

    }

}


// ==========================
// UPDATE HISTORY AFTER MATCH
// ==========================

const recordNewMatch = (
    players,
    gameType,
    history
) => {

    const ids =
        players.map(
            getPlayerId
        )


    ids.forEach(playerId => {

        incrementMap(
            history.matchCounts,
            playerId
        )

    })


    // ==========================
    // SINGLES
    // ==========================

    if (
        gameType === 'Singles' &&
        ids.length >= 2
    ) {

        incrementMap(
            history.opponentCounts,
            getPairKey(
                ids[0],
                ids[1]
            )
        )

    }


    // ==========================
    // DOUBLES
    // ==========================

    if (
        gameType === 'Doubles' &&
        ids.length >= 4
    ) {

        incrementMap(
            history.teammateCounts,
            getPairKey(
                ids[0],
                ids[1]
            )
        )


        incrementMap(
            history.teammateCounts,
            getPairKey(
                ids[2],
                ids[3]
            )
        )


        const opponentPairs = [

            [
                ids[0],
                ids[2]
            ],

            [
                ids[0],
                ids[3]
            ],

            [
                ids[1],
                ids[2]
            ],

            [
                ids[1],
                ids[3]
            ]

        ]


        opponentPairs.forEach(
            pair => {

                incrementMap(
                    history.opponentCounts,
                    getPairKey(
                        pair[0],
                        pair[1]
                    )
                )

            }
        )

    }

}


// ==========================
// SELECT SINGLES PLAYERS
// ==========================

const selectSinglesPlayers = (
    waitingPlayers,
    history
) => {

    if (waitingPlayers.length < 2) {
        return []
    }


    const players =
        waitingPlayers.map(
            (player, index) => ({

                player,

                id:
                    getPlayerId(player),

                queueIndex:
                    index,

                matchesPlayed:
                    history.matchCounts.get(
                        getPlayerId(player)
                    ) || 0

            })
        )


    // ==========================
    // FIND LOWEST MATCH COUNT
    // ==========================

    const lowestMatchCount =
        Math.min(
            ...players.map(
                player =>
                    player.matchesPlayed
            )
        )


    // ==========================
    // ANCHOR PLAYER
    //
    // Earliest waiting player
    // among players with the
    // lowest matches played.
    // ==========================

    const anchor =
        players.find(
            player =>
                player.matchesPlayed ===
                lowestMatchCount
        )


    const opponents =
        players
            .filter(
                player =>
                    player.id !==
                    anchor.id
            )
            .sort(
                (a, b) => {

                    // ==========================
                    // 1. FEWER MATCHES
                    // ==========================

                    if (
                        a.matchesPlayed !==
                        b.matchesPlayed
                    ) {

                        return (
                            a.matchesPlayed -
                            b.matchesPlayed
                        )

                    }


                    // ==========================
                    // 2. FEWER REPEATED
                    //    OPPONENT MATCHES
                    // ==========================

                    const repeatA =
                        history
                            .opponentCounts
                            .get(
                                getPairKey(
                                    anchor.id,
                                    a.id
                                )
                            ) || 0


                    const repeatB =
                        history
                            .opponentCounts
                            .get(
                                getPairKey(
                                    anchor.id,
                                    b.id
                                )
                            ) || 0


                    if (
                        repeatA !== repeatB
                    ) {

                        return (
                            repeatA -
                            repeatB
                        )

                    }


                    // ==========================
                    // 3. QUEUE POSITION
                    // ==========================

                    return (
                        a.queueIndex -
                        b.queueIndex
                    )

                }
            )


    return [

        anchor.player,

        opponents[0].player

    ]

}


// ==========================
// GENERATE 3-PLAYER
// COMBINATIONS
// ==========================

const getThreePlayerCombinations = (
    players
) => {

    const combinations = []


    for (
        let i = 0;
        i < players.length - 2;
        i++
    ) {

        for (
            let j = i + 1;
            j < players.length - 1;
            j++
        ) {

            for (
                let k = j + 1;
                k < players.length;
                k++
            ) {

                combinations.push([

                    players[i],

                    players[j],

                    players[k]

                ])

            }

        }

    }


    return combinations

}


// ==========================
// COMPARE SCORE ARRAYS
// ==========================

const compareScores = (
    scoreA,
    scoreB
) => {

    for (
        let i = 0;
        i < scoreA.length;
        i++
    ) {

        if (
            scoreA[i] !==
            scoreB[i]
        ) {

            return (
                scoreA[i] -
                scoreB[i]
            )

        }

    }


    return 0

}


// ==========================
// DOUBLES TEAM SCORE
// ==========================

const getDoublesScore = (
    players,
    playerInfo,
    history
) => {

    const [
        player1,
        player2,
        player3,
        player4
    ] = players


    const ids =
        players.map(
            getPlayerId
        )


    const matchNumbers =
        ids.map(
            id =>
                playerInfo
                    .get(id)
                    ?.matchesPlayed ||
                0
        )


    // ==========================
    // MATCH FAIRNESS
    // ==========================

    const maxMatches =
        Math.max(
            ...matchNumbers
        )


    const totalMatches =
        matchNumbers.reduce(
            (total, matches) =>
                total + matches,
            0
        )


    // ==========================
    // TEAMMATE REPEATS
    // ==========================

    const teammateRepeats =

        (
            history
                .teammateCounts
                .get(
                    getPairKey(
                        player1,
                        player2
                    )
                ) || 0
        )

        +

        (
            history
                .teammateCounts
                .get(
                    getPairKey(
                        player3,
                        player4
                    )
                ) || 0
        )


    // ==========================
    // OPPONENT REPEATS
    // ==========================

    const opponentPairs = [

        [
            player1,
            player3
        ],

        [
            player1,
            player4
        ],

        [
            player2,
            player3
        ],

        [
            player2,
            player4
        ]

    ]


    const opponentRepeats =
        opponentPairs.reduce(
            (
                total,
                pair
            ) => {

                return (
                    total +
                    (
                        history
                            .opponentCounts
                            .get(
                                getPairKey(
                                    pair[0],
                                    pair[1]
                                )
                            ) || 0
                    )
                )

            },
            0
        )


    // ==========================
    // QUEUE POSITION
    // ==========================

    const queueScore =
        ids.reduce(
            (
                total,
                id
            ) => {

                return (
                    total +
                    (
                        playerInfo
                            .get(id)
                            ?.queueIndex ||
                        0
                    )
                )

            },
            0
        )


    /*
        PRIORITY ORDER:

        1. Lowest maximum matches
        2. Lowest total matches
        3. Avoid same teammates
        4. Avoid same opponents
        5. Queue order
    */

    return [

        maxMatches,

        totalMatches,

        teammateRepeats,

        opponentRepeats,

        queueScore

    ]

}


// ==========================
// SELECT DOUBLES PLAYERS
// ==========================

const selectDoublesPlayers = (
    waitingPlayers,
    history
) => {

    if (waitingPlayers.length < 4) {
        return []
    }


    const playerData =
        waitingPlayers.map(
            (player, index) => ({

                player,

                id:
                    getPlayerId(player),

                queueIndex:
                    index,

                matchesPlayed:
                    history
                        .matchCounts
                        .get(
                            getPlayerId(
                                player
                            )
                        ) || 0

            })
        )


    const playerInfo =
        new Map(
            playerData.map(
                data => [
                    data.id,
                    data
                ]
            )
        )


    // ==========================
    // LOWEST MATCH COUNT
    // ==========================

    const lowestMatchCount =
        Math.min(
            ...playerData.map(
                player =>
                    player.matchesPlayed
            )
        )


    // ==========================
    // ANCHOR PLAYER
    //
    // This guarantees that
    // someone waiting longest
    // with the fewest matches
    // cannot be skipped.
    // ==========================

    const anchor =
        playerData.find(
            player =>
                player.matchesPlayed ===
                lowestMatchCount
        )


    // ==========================
    // CANDIDATES
    //
    // Sort by matches first,
    // then queue position.
    // Limit pool to prevent
    // excessive combinations.
    // ==========================

    const candidates =
        playerData
            .filter(
                player =>
                    player.id !==
                    anchor.id
            )
            .sort(
                (a, b) => {

                    if (
                        a.matchesPlayed !==
                        b.matchesPlayed
                    ) {

                        return (
                            a.matchesPlayed -
                            b.matchesPlayed
                        )

                    }


                    return (
                        a.queueIndex -
                        b.queueIndex
                    )

                }
            )
            .slice(0, 10)


    const combinations =
        getThreePlayerCombinations(
            candidates
        )


    let bestPlayers = null

    let bestScore = null


    combinations.forEach(
        combination => {

            const [
                a,
                b,
                c
            ] = combination


            // ==========================
            // THREE POSSIBLE TEAM SPLITS
            //
            // First 2 = Team 1
            // Last 2  = Team 2
            // ==========================

            const teamOptions = [

                [
                    anchor.player,
                    a.player,
                    b.player,
                    c.player
                ],

                [
                    anchor.player,
                    b.player,
                    a.player,
                    c.player
                ],

                [
                    anchor.player,
                    c.player,
                    a.player,
                    b.player
                ]

            ]


            teamOptions.forEach(
                players => {

                    const score =
                        getDoublesScore(
                            players,
                            playerInfo,
                            history
                        )


                    if (
                        !bestScore ||
                        compareScores(
                            score,
                            bestScore
                        ) < 0
                    ) {

                        bestScore =
                            score

                        bestPlayers =
                            players

                    }

                }
            )

        }
    )


    return (
        bestPlayers || []
    )

}


// ==========================
// EMIT QUEUE UPDATE
// ==========================

const emitQueueUpdate = (req, sessionId) => {

    const io = req.app.get('io')

    if (!io) return

    io
        .to(`queue-${sessionId}`)
        .emit('queueUpdated', {
            sessionId:
                sessionId.toString()
        })

}

// ==========================
// CREATE QUEUE SESSION
// ==========================

router.post(
    '/create',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Organizer') {
                return res.status(403).json({
                    message:
                        'Only organizers can create queue sessions'
                })
            }

            const {
                name,
                location,
                gameType,
                numberOfCourts
            } = req.body


            if (
                !name ||
                !location ||
                !gameType ||
                !numberOfCourts
            ) {
                return res.status(400).json({
                    message:
                        'Please complete all required fields'
                })
            }


            if (
                !['Singles', 'Doubles']
                    .includes(gameType)
            ) {
                return res.status(400).json({
                    message:
                        'Invalid game type'
                })
            }


            const session =
                await QueueSession.create({

                    name,

                    location,

                    gameType,

                    numberOfCourts,

                    organizer:
                        req.user.id

                })


            return res.status(201).json({
                message:
                    'Queue session created successfully',
                session
            })


        } catch (err) {

            console.error(
                'CREATE QUEUE ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to create queue session'
            })

        }

    }
)

// ==========================
// GET QUEUE SESSIONS
// ==========================

router.get(
    '/',
    async (req, res) => {

        try {

            const sessions =
                await QueueSession.find()
                    .populate(
                        'organizer',
                        'userId firstName lastName username'
                    )
                    .populate(
                        'waitingPlayers',
                        'userId firstName lastName username'
                    )
                    .sort({
                        createdAt: -1
                    })


            return res.json(sessions)


        } catch (err) {

            console.error(
                'GET QUEUES ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to load queue sessions'
            })

        }

    }
)


// ==========================
// UPDATE QUEUE SESSION STATUS
// ==========================

router.put(
    '/:id/status',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Organizer') {
                return res.status(403).json({
                    message:
                        'Only organizers can manage Quick Play sessions'
                })
            }


            const {
                status
            } = req.body


            if (
                !['Open', 'Closed', 'Finished']
                    .includes(status)
            ) {
                return res.status(400).json({
                    message:
                        'Invalid session status'
                })
            }


            const session =
                await QueueSession.findById(
                    req.params.id
                )


            if (!session) {
                return res.status(404).json({
                    message:
                        'Queue session not found'
                })
            }


            if (
                session.organizer.toString() !==
                req.user.id
            ) {
                return res.status(403).json({
                    message:
                        'You are not the organizer of this session'
                })
            }


            if (
                session.status === 'Finished'
            ) {
                return res.status(400).json({
                    message:
                        'Finished sessions cannot be changed'
                })
            }


            // ==========================
            // FINISH SESSION
            // ==========================

            if (status === 'Finished') {

                const activeMatches =
                    await QueueMatch.countDocuments({
                        queueSession:
                            session._id,
                        status:
                            'Playing'
                    })


                if (activeMatches > 0) {
                    return res.status(400).json({
                        message:
                            'Finish all active matches before ending this session'
                    })
                }


                session.status =
                    'Finished'

                session.waitingPlayers = []

                await session.save()


                return res.json({
                    message:
                        'Quick Play session finished successfully',
                    session
                })

            }


            session.status = status

            await session.save()


            return res.json({

                message:
                    status === 'Closed'
                        ? 'Quick Play session closed'
                        : 'Quick Play session reopened',

                session

            })


        } catch (err) {

            console.error(
                'UPDATE QUEUE STATUS ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to update session status'
            })

        }

    }
)


// ==========================
// ORGANIZER QUICK PLAY STATS
// ==========================

router.get(
    '/organizer/stats',
    authMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Organizer') {

                return res.status(403).json({
                    message:
                        'Organizer access required'
                })

            }


            // ==========================
            // ORGANIZER SESSIONS
            // ==========================

            const sessions =
                await QueueSession.find({
                    organizer:
                        req.user.id
                })


            const sessionIds =
                sessions.map(
                    session =>
                        session._id
                )


            // ==========================
            // TOTAL SESSIONS
            // ==========================

            const totalSessions =
                sessions.length


            // ==========================
            // ACTIVE SESSIONS
            // OPEN + CLOSED
            // ==========================

            const activeSessions =
                sessions.filter(
                    session =>
                        session.status ===
                            'Open' ||
                        session.status ===
                            'Closed'
                ).length


            // ==========================
            // CURRENTLY QUEUED PLAYERS
            // ==========================

            const playersQueued =
                sessions

                    .filter(
                        session =>
                            session.status ===
                                'Open' ||
                            session.status ===
                                'Closed'
                    )

                    .reduce(
                        (
                            total,
                            session
                        ) => {

                            return (
                                total +
                                (
                                    session
                                        .waitingPlayers
                                        ?.length ||
                                    0
                                )
                            )

                        },
                        0
                    )


            // ==========================
            // TODAY
            // ==========================

            const startOfToday =
                new Date()

            startOfToday.setHours(
                0,
                0,
                0,
                0
            )


            const startOfTomorrow =
                new Date(
                    startOfToday
                )

            startOfTomorrow.setDate(
                startOfTomorrow.getDate() +
                1
            )


            // ==========================
            // MATCHES COMPLETED TODAY
            // ==========================

            const matchesCompletedToday =
                await QueueMatch.countDocuments({

                    queueSession: {
                        $in:
                            sessionIds
                    },

                    status:
                        'Finished',

                    finishedAt: {
                        $gte:
                            startOfToday,

                        $lt:
                            startOfTomorrow
                    }

                })


            // ==========================
            // RECENT QUICK PLAY
            // ==========================

            const recentSessions =
                await QueueSession.find({

                    organizer:
                        req.user.id

                })

                    .select(
                        'name location gameType numberOfCourts waitingPlayers status createdAt'
                    )

                    .sort({
                        createdAt: -1
                    })

                    .limit(5)


            return res.json({

                activeSessions,

                totalSessions,

                playersQueued,

                matchesCompletedToday,

                recentSessions

            })


        } catch (err) {

            console.error(
                'ORGANIZER QUICK PLAY STATS ERROR:',
                err
            )


            return res.status(500).json({

                message:
                    'Failed to load Quick Play statistics'

            })

        }

    }
)



// ==========================
// ORGANIZER QUICK PLAY REPORT LIST
// ==========================

router.get(
    '/organizer/reports',
    authMiddleware,
    async (req, res) => {

        try {

            if (
                req.user.role !==
                'Organizer'
            ) {

                return res.status(403).json({
                    message:
                        'Organizer access required'
                })

            }


            const sessions =
                await QueueSession.find({
                    organizer:
                        req.user.id,
                    status:
                        'Finished'
                })
                .select(
                    'name location gameType numberOfCourts participants status createdAt updatedAt'
                )
                .sort({
                    updatedAt: -1
                })


            const sessionIds =
                sessions.map(
                    session =>
                        session._id
                )


            const matchCounts =
                await QueueMatch.aggregate([
                    {
                        $match: {
                            queueSession: {
                                $in:
                                    sessionIds
                            }
                        }
                    },
                    {
                        $group: {
                            _id:
                                '$queueSession',
                            totalMatches: {
                                $sum:
                                    1
                            },
                            completedMatches: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                '$status',
                                                'Finished'
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ])


            const matchCountMap =
                new Map(
                    matchCounts.map(
                        item => [
                            item._id.toString(),
                            item
                        ]
                    )
                )


            const reports =
                sessions.map(
                    session => {

                        const counts =
                            matchCountMap.get(
                                session._id.toString()
                            ) || {
                                totalMatches:
                                    0,
                                completedMatches:
                                    0
                            }


                        return {
                            _id:
                                session._id,
                            name:
                                session.name,
                            location:
                                session.location,
                            gameType:
                                session.gameType,
                            numberOfCourts:
                                session.numberOfCourts,
                            participantCount:
                                session.participants?.length ||
                                0,
                            totalMatches:
                                counts.totalMatches,
                            completedMatches:
                                counts.completedMatches,
                            status:
                                session.status,
                            createdAt:
                                session.createdAt,
                            finishedAt:
                                session.updatedAt
                        }

                    }
                )


            return res.json({
                reports
            })

        } catch (err) {

            console.error(
                'QUICK PLAY REPORT LIST ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to load Quick Play reports'
            })

        }

    }
)


// ==========================
// QUICK PLAY REPORT
// ==========================

router.get(
    '/:id/report',
    authMiddleware,
    async (req, res) => {

        try {

            const session =
                await QueueSession
                    .findById(
                        req.params.id
                    )
                    .populate(
                        'organizer',
                        'userId firstName lastName username email'
                    )
                    .populate(
                        'participants',
                        'userId firstName lastName username'
                    )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Quick Play session not found'
                })

            }


            if (
                req.user.role !==
                    'Organizer' ||
                session.organizer?._id?.toString() !==
                    req.user.id
            ) {

                return res.status(403).json({
                    message:
                        'You can only view reports for Quick Play sessions you organized'
                })

            }


            if (
                session.status !==
                'Finished'
            ) {

                return res.status(400).json({
                    message:
                        'A report is available only after the Quick Play session is finished'
                })

            }


            const matches =
                await QueueMatch.find({
                    queueSession:
                        session._id
                })
                .populate(
                    'players',
                    'userId firstName lastName username'
                )
                .populate(
                    'teamA',
                    'userId firstName lastName username'
                )
                .populate(
                    'teamB',
                    'userId firstName lastName username'
                )
                .sort({
                    finishedAt: 1,
                    createdAt: 1
                })


            const finishedMatches =
                matches.filter(
                    match =>
                        match.status ===
                        'Finished'
                )


            const playerStats =
                new Map()


            for (
                const player of
                session.participants || []
            ) {

                playerStats.set(
                    player._id.toString(),
                    {
                        _id:
                            player._id,
                        userId:
                            player.userId,
                        firstName:
                            player.firstName,
                        lastName:
                            player.lastName,
                        username:
                            player.username,
                        matchesPlayed:
                            0,
                        wins:
                            0,
                        losses:
                            0,
                        winRate:
                            0
                    }
                )

            }


            for (
                const match of
                finishedMatches
            ) {

                const fallbackPlayers =
                    match.players || []

                const playersPerTeam =
                    session.gameType ===
                    'Doubles'
                        ? 2
                        : 1


                const teamA =
                    match.teamA?.length >
                    0
                        ? match.teamA
                        : fallbackPlayers.slice(
                            0,
                            playersPerTeam
                        )


                const teamB =
                    match.teamB?.length >
                    0
                        ? match.teamB
                        : fallbackPlayers.slice(
                            playersPerTeam,
                            playersPerTeam *
                            2
                        )


                const allPlayers = [
                    ...teamA,
                    ...teamB
                ]


                for (
                    const player of
                    allPlayers
                ) {

                    const id =
                        (
                            player?._id ||
                            player
                        ).toString()

                    const stat =
                        playerStats.get(
                            id
                        )

                    if (stat) {
                        stat.matchesPlayed++
                    }

                }


                if (
                    match.winnerTeam !==
                        'A' &&
                    match.winnerTeam !==
                        'B'
                ) {
                    continue
                }


                const winningTeam =
                    match.winnerTeam ===
                    'A'
                        ? teamA
                        : teamB


                const losingTeam =
                    match.winnerTeam ===
                    'A'
                        ? teamB
                        : teamA


                for (
                    const player of
                    winningTeam
                ) {

                    const id =
                        (
                            player?._id ||
                            player
                        ).toString()

                    const stat =
                        playerStats.get(
                            id
                        )

                    if (stat) {
                        stat.wins++
                    }

                }


                for (
                    const player of
                    losingTeam
                ) {

                    const id =
                        (
                            player?._id ||
                            player
                        ).toString()

                    const stat =
                        playerStats.get(
                            id
                        )

                    if (stat) {
                        stat.losses++
                    }

                }

            }


            const stats =
                Array.from(
                    playerStats.values()
                )
                .map(
                    player => {

                        const decided =
                            player.wins +
                            player.losses


                        return {
                            ...player,
                            winRate:
                                decided >
                                0
                                    ? Math.round(
                                        (
                                            player.wins /
                                            decided
                                        ) *
                                        100
                                    )
                                    : 0
                        }

                    }
                )
                .sort(
                    (a, b) => {

                        if (
                            b.wins !==
                            a.wins
                        ) {
                            return (
                                b.wins -
                                a.wins
                            )
                        }

                        if (
                            b.matchesPlayed !==
                            a.matchesPlayed
                        ) {
                            return (
                                b.matchesPlayed -
                                a.matchesPlayed
                            )
                        }

                        return (
                            b.winRate -
                            a.winRate
                        )

                    }
                )


            const startedAt =
                session.createdAt


            const finishedAt =
                session.updatedAt


            const durationMinutes =
                startedAt &&
                finishedAt
                    ? Math.max(
                        0,
                        Math.round(
                            (
                                new Date(
                                    finishedAt
                                ) -
                                new Date(
                                    startedAt
                                )
                            ) /
                            60000
                        )
                    )
                    : null


            return res.json({

                generatedAt:
                    new Date(),

                session: {
                    _id:
                        session._id,
                    name:
                        session.name,
                    location:
                        session.location,
                    gameType:
                        session.gameType,
                    numberOfCourts:
                        session.numberOfCourts,
                    status:
                        session.status,
                    createdAt:
                        session.createdAt,
                    finishedAt:
                        session.updatedAt,
                    organizer:
                        session.organizer
                },

                summary: {
                    participantCount:
                        session.participants?.length ||
                        0,
                    totalMatches:
                        matches.length,
                    completedMatches:
                        finishedMatches.length,
                    durationMinutes
                },

                participants:
                    session.participants ||
                    [],

                playerStats:
                    stats,

                matches

            })

        } catch (err) {

            console.error(
                'QUICK PLAY REPORT ERROR:',
                err
            )

            return res.status(500).json({
                message:
                    'Failed to generate Quick Play report'
            })

        }

    }
)


// ==========================
// GET QUEUE SESSION STATS
// ==========================

router.get(
    '/:id/stats',
    async (req, res) => {

        try {

            const session =
                await QueueSession
                    .findById(req.params.id)
                    .populate(
                        'participants',
                        'userId firstName lastName username'
                    )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Queue session not found'
                })

            }


            const matches =
                await QueueMatch.find({
                    queueSession:
                        session._id
                })


            const finishedMatches =
                matches.filter(
                    match =>
                        match.status === 'Finished'
                )


            // ==========================
            // PLAYER STATISTICS
            // ==========================

            const playerStats = {}


            session.participants.forEach(
                player => {

                    playerStats[
                        player._id.toString()
                    ] = {

                        _id:
                            player._id,

                        userId:
                            player.userId,

                        firstName:
                            player.firstName,

                        lastName:
                            player.lastName,

                        username:
                            player.username,

                        matchesPlayed: 0,

                        wins: 0,

                        losses: 0,

                        winRate: 0

                    }

                }
            )


            // ==========================
            // PROCESS FINISHED MATCHES
            // ==========================

            finishedMatches.forEach(
                match => {

                    // ==========================
                    // MATCHES PLAYED
                    // ==========================

                    match.players.forEach(
                        playerId => {

                            const id =
                                playerId.toString()


                            if (playerStats[id]) {

                                playerStats[id]
                                    .matchesPlayed++

                            }

                        }
                    )


                    // ==========================
                    // OLD MATCH WITHOUT RESULT
                    // ==========================

                    if (
                        match.winnerTeam !== 'A' &&
                        match.winnerTeam !== 'B'
                    ) {

                        return

                    }


                    const playersPerTeam =
                        session.gameType === 'Doubles'
                            ? 2
                            : 1


                    // ==========================
                    // TEAM A
                    // ==========================

                    const teamA =
                        match.teamA?.length > 0

                            ? match.teamA

                            : match.players.slice(
                                0,
                                playersPerTeam
                            )


                    // ==========================
                    // TEAM B
                    // ==========================

                    const teamB =
                        match.teamB?.length > 0

                            ? match.teamB

                            : match.players.slice(
                                playersPerTeam,
                                playersPerTeam * 2
                            )


                    const winningTeam =
                        match.winnerTeam === 'A'
                            ? teamA
                            : teamB


                    const losingTeam =
                        match.winnerTeam === 'A'
                            ? teamB
                            : teamA


                    // ==========================
                    // ADD WINS
                    // ==========================

                    winningTeam.forEach(
                        playerId => {

                            const id =
                                playerId.toString()


                            if (playerStats[id]) {

                                playerStats[id]
                                    .wins++

                            }

                        }
                    )


                    // ==========================
                    // ADD LOSSES
                    // ==========================

                    losingTeam.forEach(
                        playerId => {

                            const id =
                                playerId.toString()


                            if (playerStats[id]) {

                                playerStats[id]
                                    .losses++

                            }

                        }
                    )

                }
            )


            // ==========================
            // CALCULATE WIN RATE
            // ==========================

            const stats =
                Object.values(
                    playerStats
                )
                .map(
                    player => {

                        const decidedMatches =
                            player.wins +
                            player.losses


                        return {

                            ...player,

                            winRate:
                                decidedMatches > 0

                                    ? Math.round(
                                        (
                                            player.wins /
                                            decidedMatches
                                        ) * 100
                                    )

                                    : 0

                        }

                    }
                )
                .sort(
                    (a, b) =>
                        b.matchesPlayed -
                        a.matchesPlayed
                )


            return res.json({

                totalParticipants:
                    session.participants.length,

                totalMatches:
                    matches.length,

                finishedMatches:
                    finishedMatches.length,

                playerStats:
                    stats

            })


        } catch (err) {

            console.error(
                'QUEUE STATS ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to load queue statistics'
            })

        }

    }
)


// ==========================
// GET QUEUE SESSION
// ==========================

router.get(
    '/:id',
    async (req, res) => {

        try {

            const session =
                await QueueSession
                    .findById(req.params.id)
                    .populate(
                        'organizer',
                        'userId firstName lastName username'
                    )
                    .populate(
                        'waitingPlayers',
                        'userId firstName lastName username'
                    )
                    .populate(
                        'activePlayers',
                        'userId firstName lastName username'
                    )
                    .populate(
                        'participants',
                        'userId firstName lastName username'
                    )


            if (!session) {
                return res.status(404).json({
                    message:
                        'Queue session not found'
                })
            }


            const matches =
                await QueueMatch
                    .find({
                        queueSession:
                            session._id
                    })
                    .populate(
                        'players',
                        'userId firstName lastName username'
                    )

                    .populate(
                        'teamA',
                        'userId firstName lastName username'
                    )

                    .populate(
                        'teamB',
                        'userId firstName lastName username'
                    )
                    .sort({
                        courtNumber: 1
                    })


            return res.json({
                session,
                matches
            })


        } catch (err) {

            return res.status(500).json({
                message:
                    'Failed to load queue session'
            })

        }

    }
)

// ==========================
// JOIN QUEUE
// ==========================

router.post(
    '/join/:id',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            // Only players can join
            if (req.user.role !== 'Player') {

                return res.status(403).json({
                    message:
                        'Only players can join Quick Play sessions'
                })

            }


            // Find queue session
            const session =
                await QueueSession.findById(
                    req.params.id
                )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Queue session not found'
                })

            }


            // ==========================
            // ORGANIZER CANNOT JOIN
            // THEIR OWN QUICK PLAY
            // ==========================

            if (
                session.organizer.toString() ===
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        'You cannot join your own Quick Play session as a player'
                })

            }


            // Session must be open
            if (session.status !== 'Open') {

                return res.status(400).json({
                    message:
                        'This Quick Play session is not open'
                })

            }


            const userId =
                req.user.id


            // ==========================
            // CHECK IF ALREADY WAITING
            // ==========================

            const alreadyWaiting =
                session.waitingPlayers.some(
                    playerId =>
                        playerId.toString() ===
                        userId
                )


            if (alreadyWaiting) {

                return res.status(400).json({
                    message:
                        'You are already in the queue'
                })

            }


            // ==========================
            // CHECK IF CURRENTLY PLAYING
            // ==========================

            const activeMatch =
                await QueueMatch.findOne({

                    queueSession:
                        session._id,

                    status:
                        'Playing',

                    players:
                        userId

                })


            if (activeMatch) {

                return res.status(400).json({
                    message:
                        'You are currently playing'
                })

            }


            // ==========================
            // ADD TO PARTICIPANTS
            // ==========================

            const alreadyParticipant =
                session.participants.some(
                    playerId =>
                        playerId.toString() ===
                        userId
                )


            if (!alreadyParticipant) {

                session.participants.push(
                    userId
                )

            }


            // ==========================
            // ADD TO ACTIVE PLAYERS
            // ==========================

            const alreadyActive =
                session.activePlayers.some(
                    playerId =>
                        playerId.toString() ===
                        userId
                )


            if (!alreadyActive) {

                session.activePlayers.push(
                    userId
                )

            }


            // ==========================
            // ADD TO WAITING QUEUE
            // ==========================

            session.waitingPlayers.push(
                userId
            )


            await session.save()


            // ==========================
            // REAL-TIME UPDATE
            // ==========================

            emitQueueUpdate(
                req,
                session._id
            )


            // ==========================
            // GET UPDATED SESSION
            // ==========================

            const updatedSession =
                await QueueSession
                    .findById(
                        session._id
                    )
                    .populate(
                        'waitingPlayers',
                        'userId firstName lastName username'
                    )
                    .populate(
                        'activePlayers',
                        'userId firstName lastName username'
                    )
                    .populate(
                        'participants',
                        'userId firstName lastName username'
                    )


            return res.status(200).json({

                message:
                    'Joined Quick Play successfully',

                session:
                    updatedSession

            })


        } catch (err) {

            console.error(
                'JOIN QUEUE ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to join Quick Play'
            })

        }

    }
)

// ==========================
// FINISH QUEUE MATCH
// ORGANIZER ONLY
// ==========================

router.put(
    '/:sessionId/matches/:matchId/finish',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            // ==========================
            // ORGANIZER ONLY
            // ==========================

            if (req.user.role !== 'Organizer') {

                return res.status(403).json({
                    message:
                        'Only organizers can finish matches'
                })

            }


            // ==========================
            // FIND SESSION
            // ==========================

            const session =
                await QueueSession.findById(
                    req.params.sessionId
                )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Queue session not found'
                })

            }


            // ==========================
            // CHECK OWNERSHIP
            // ==========================

            if (
                session.organizer.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        'You are not the organizer of this session'
                })

            }


            // ==========================
            // FIND MATCH
            // ==========================

            const match =
                await QueueMatch.findOne({

                    _id:
                        req.params.matchId,

                    queueSession:
                        session._id

                })


            if (!match) {

                return res.status(404).json({
                    message:
                        'Match not found'
                })

            }


            if (
                match.status ===
                'Finished'
            ) {

                return res.status(400).json({
                    message:
                        'Match is already finished'
                })

            }


            // ==========================
            // GET SCORES
            // ==========================

            const {
                scores
            } = req.body


            // ==========================
            // VALIDATE SCORES
            // ==========================

            if (
                !Array.isArray(scores) ||
                scores.length === 0
            ) {

                return res.status(400).json({
                    message:
                        'Please enter the match score'
                })

            }


            if (scores.length > 3) {

                return res.status(400).json({
                    message:
                        'A match can only contain up to 3 games'
                })

            }

            if (scores.length < 2) {

                return res.status(400).json({
                    message:
                        'A match requires at least 2 games'
                })

            }


            let teamAWins = 0
            let teamBWins = 0


            for (
                let index = 0;
                index < scores.length;
                index++
            ) {

                const score =
                    scores[index]


                const teamAScore =
                    Number(
                        score.teamA
                    )


                const teamBScore =
                    Number(
                        score.teamB
                    )


                // ==========================
                // VALID NUMBER
                // ==========================

                if (
                    !Number.isInteger(teamAScore) ||
                    !Number.isInteger(teamBScore) ||
                    teamAScore < 0 ||
                    teamBScore < 0
                ) {

                    return res.status(400).json({
                        message:
                            `Invalid score for Game ${index + 1}`
                    })

                }


                // ==========================
                // BADMINTON MAX SCORE
                // ==========================

                if (
                    teamAScore > 30 ||
                    teamBScore > 30
                ) {

                    return res.status(400).json({
                        message:
                            `Game ${index + 1} score cannot exceed 30`
                    })

                }


                // ==========================
                // NO TIED GAME
                // ==========================

                if (
                    teamAScore ===
                    teamBScore
                ) {

                    return res.status(400).json({
                        message:
                            `Game ${index + 1} cannot end in a tie`
                    })

                }


                // ==========================
                // DETERMINE GAME WINNER
                // ==========================

                if (
                    teamAScore >
                    teamBScore
                ) {

                    teamAWins++

                } else {

                    teamBWins++

                }

            }


            // ==========================
            // BEST OF 3 VALIDATION
            // ==========================

            const game1Winner =
                Number(scores[0].teamA) >
                Number(scores[0].teamB)
                    ? 'A'
                    : 'B'


            const game2Winner =
                Number(scores[1].teamA) >
                Number(scores[1].teamB)
                    ? 'A'
                    : 'B'


            // ==========================
            // MATCH ENDS 2-0
            // ==========================

            if (
                game1Winner ===
                game2Winner
            ) {

                if (scores.length === 3) {

                    return res.status(400).json({
                        message:
                            'Game 3 is not needed because the match was already won 2-0'
                    })

                }

            }


            // ==========================
            // MATCH IS 1-1
            // GAME 3 REQUIRED
            // ==========================

            if (
                game1Winner !==
                game2Winner &&
                scores.length !== 3
            ) {

                return res.status(400).json({
                    message:
                        'Game 3 is required because the match is tied 1-1'
                })

            }


            // ==========================
            // WINNER MUST HAVE 2 WINS
            // ==========================

            if (
                teamAWins !== 2 &&
                teamBWins !== 2
            ) {

                return res.status(400).json({
                    message:
                        'Invalid best-of-3 match result'
                })

            }


            const winnerTeam =
                teamAWins === 2
                    ? 'A'
                    : 'B'


            // ==========================
            // SAVE RESULT
            // ==========================

            match.scores =
                scores.map(
                    score => ({

                        teamA:
                            Number(
                                score.teamA
                            ),

                        teamB:
                            Number(
                                score.teamB
                            )

                    })
                )


            match.winnerTeam =
                winnerTeam


            match.status =
                'Finished'


            match.finishedAt =
                new Date()


            await match.save()


            // ==========================
            // RETURN PLAYERS TO QUEUE
            // ==========================

            for (
                const playerId
                of match.players
            ) {

                const isActive =
                    session.activePlayers.some(
                        id =>
                            id.toString() ===
                            playerId.toString()
                    )


                if (isActive) {

                    const alreadyWaiting =
                        session.waitingPlayers.some(
                            id =>
                                id.toString() ===
                                playerId.toString()
                        )


                    if (!alreadyWaiting) {

                        session.waitingPlayers.push(
                            playerId
                        )

                    }

                }

            }


            await session.save()


            // ==========================
            // REAL-TIME UPDATE
            // ==========================

            emitQueueUpdate(
                req,
                session._id
            )


            // ==========================
            // RESPONSE
            // ==========================

            return res.json({

                message:
                    `Match finished. Team ${winnerTeam} wins!`,

                winnerTeam,

                scores:
                    match.scores

            })


        } catch (err) {

            console.error(
                'FINISH QUEUE MATCH ERROR:',
                err
            )


            return res.status(500).json({

                message:
                    'Failed to finish match'

            })

        }

    }
)


// ==========================
// START MATCH ON COURT
// ORGANIZER ONLY
// ==========================

router.put(
    '/:id/courts/:courtNumber/start',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Organizer') {

                return res.status(403).json({
                    message:
                        'Only organizers can start matches'
                })

            }


            const session =
                await QueueSession.findById(
                    req.params.id
                )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Queue session not found'
                })

            }


            if (
                session.organizer.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        'You are not the organizer of this session'
                })

            }


            if (session.status !== 'Open') {

                return res.status(400).json({
                    message:
                        'Matches can only be started while the session is open'
                })

            }


            const courtNumber =
                Number(
                    req.params.courtNumber
                )


            if (
                !Number.isInteger(
                    courtNumber
                ) ||
                courtNumber < 1 ||
                courtNumber >
                    session.numberOfCourts
            ) {

                return res.status(400).json({
                    message:
                        'Invalid court number'
                })

            }


            const activeCourtMatch =
                await QueueMatch.findOne({

                    queueSession:
                        session._id,

                    courtNumber,

                    status:
                        'Playing'

                })


            if (activeCourtMatch) {

                return res.status(400).json({
                    message:
                        `Court ${courtNumber} already has an active match`
                })

            }


            const playersPerMatch =
                session.gameType === 'Doubles'
                    ? 4
                    : 2


            const {
                playerIds
            } = req.body


            if (
                session.waitingPlayers.length <
                playersPerMatch
            ) {

                return res.status(400).json({
                    message:
                        session.gameType === 'Doubles'
                            ? 'At least 4 waiting players are required to start a doubles match'
                            : 'At least 2 waiting players are required to start a singles match'
                })

            }


            const existingMatches =
                await QueueMatch.find({

                    queueSession:
                        session._id,

                    status: {
                        $in: [
                            'Playing',
                            'Finished'
                        ]
                    }

                })


            let players = []


            // ==========================
            // ORGANIZER MANUAL SELECTION
            // ==========================

            if (
                Array.isArray(
                    playerIds
                ) &&
                playerIds.length > 0
            ) {

                if (
                    playerIds.length !==
                    playersPerMatch
                ) {

                    return res.status(400).json({
                        message:
                            session.gameType === 'Doubles'
                                ? 'Select exactly 4 players'
                                : 'Select exactly 2 players'
                    })

                }


                const uniquePlayerIds =
                    new Set(
                        playerIds
                    )


                if (
                    uniquePlayerIds.size !==
                    playerIds.length
                ) {

                    return res.status(400).json({
                        message:
                            'A player cannot be assigned more than once'
                    })

                }


                const waitingPlayerIds =
                    session.waitingPlayers.map(
                        player =>
                            getPlayerId(
                                player
                            )
                    )


                const allPlayersWaiting =
                    playerIds.every(
                        playerId =>
                            waitingPlayerIds.includes(
                                playerId
                            )
                    )


                if (!allPlayersWaiting) {

                    return res.status(400).json({
                        message:
                            'One or more selected players are no longer in the waiting queue'
                    })

                }


                const waitingPlayerMap =
                    new Map(
                        session.waitingPlayers.map(
                            player => [
                                getPlayerId(
                                    player
                                ),
                                player
                            ]
                        )
                    )


                players =
                    playerIds.map(
                        playerId =>
                            waitingPlayerMap.get(
                                playerId
                            )
                    )

            }


            // ==========================
            // FALLBACK FAIR SELECTION
            // ==========================

            else {

                const history =
                    buildMatchHistory(
                        existingMatches,
                        session.gameType
                    )


                if (
                    session.gameType ===
                    'Singles'
                ) {

                    players =
                        selectSinglesPlayers(
                            session.waitingPlayers,
                            history
                        )

                }


                if (
                    session.gameType ===
                    'Doubles'
                ) {

                    players =
                        selectDoublesPlayers(
                            session.waitingPlayers,
                            history
                        )

                }

            }


            if (
                players.length !==
                playersPerMatch
            ) {

                return res.status(400).json({
                    message:
                        'Unable to select enough players for this match'
                })

            }


            const selectedIds =
                new Set(
                    players.map(
                        getPlayerId
                    )
                )


            session.waitingPlayers =
                session.waitingPlayers.filter(
                    player =>
                        !selectedIds.has(
                            getPlayerId(
                                player
                            )
                        )
                )


            let teamA = []
            let teamB = []


            if (
                session.gameType ===
                'Singles'
            ) {

                teamA = [
                    players[0]
                ]

                teamB = [
                    players[1]
                ]

            }


            if (
                session.gameType ===
                'Doubles'
            ) {

                teamA = [
                    players[0],
                    players[1]
                ]

                teamB = [
                    players[2],
                    players[3]
                ]

            }


            const match =
                await QueueMatch.create({

                    queueSession:
                        session._id,

                    courtNumber,

                    players,

                    teamA,

                    teamB,

                    status:
                        'Playing',

                    startedAt:
                        new Date()

                })


            await session.save()


            emitQueueUpdate(
                req,
                session._id
            )


            const populatedMatch =
                await QueueMatch.findById(
                    match._id
                )
                    .populate(
                        'players',
                        'userId firstName lastName username'
                    )
                    .populate(
                        'teamA',
                        'userId firstName lastName username'
                    )
                    .populate(
                        'teamB',
                        'userId firstName lastName username'
                    )


            return res.json({

                message:
                    `Match started on Court ${courtNumber}`,

                match:
                    populatedMatch

            })


        } catch (err) {

            console.error(
                'START COURT MATCH ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to start match'
            })

        }

    }
)


// ==========================
// ADD COURT
// ORGANIZER ONLY
// ==========================

router.put(
    '/:id/add-court',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Organizer') {

                return res.status(403).json({
                    message:
                        'Only organizers can add courts'
                })

            }


            const session =
                await QueueSession.findById(
                    req.params.id
                )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Queue session not found'
                })

            }


            if (
                session.organizer.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        'You are not the organizer of this session'
                })

            }


            if (session.status !== 'Open') {

                return res.status(400).json({
                    message:
                        'Courts can only be added while the session is open'
                })

            }


            session.numberOfCourts += 1


            await session.save()


            emitQueueUpdate(
                req,
                session._id
            )


            return res.json({

                message:
                    `Court ${session.numberOfCourts} added successfully`,

                numberOfCourts:
                    session.numberOfCourts

            })


        } catch (err) {

            console.error(
                'ADD COURT ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to add court'
            })

        }

    }
)


// ==========================
// REMOVE COURT
// ORGANIZER ONLY
// ==========================

router.put(
    '/:id/remove-court',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            if (req.user.role !== 'Organizer') {

                return res.status(403).json({
                    message:
                        'Only organizers can remove courts'
                })

            }


            const session =
                await QueueSession.findById(
                    req.params.id
                )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Queue session not found'
                })

            }


            if (
                session.organizer.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        'You are not the organizer of this session'
                })

            }


            if (session.status !== 'Open') {

                return res.status(400).json({
                    message:
                        'Courts can only be removed while the session is open'
                })

            }


            if (session.numberOfCourts <= 1) {

                return res.status(400).json({
                    message:
                        'Quick Play must have at least one court'
                })

            }


            const courtToRemove =
                session.numberOfCourts


            const activeMatch =
                await QueueMatch.findOne({

                    queueSession:
                        session._id,

                    courtNumber:
                        courtToRemove,

                    status:
                        'Playing'

                })


            if (activeMatch) {

                return res.status(400).json({
                    message:
                        `Court ${courtToRemove} currently has an active match. Finish the match before removing this court.`
                })

            }


            session.numberOfCourts -= 1

            await session.save()


            emitQueueUpdate(
                req,
                session._id
            )


            return res.json({

                message:
                    `Court ${courtToRemove} removed successfully`,

                numberOfCourts:
                    session.numberOfCourts

            })


        } catch (err) {

            console.error(
                'REMOVE COURT ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to remove court'
            })

        }

    }
)

// ==========================
// REMOVE PLAYER FROM QUICK PLAY
// ORGANIZER ONLY
// ==========================

router.delete(
    '/:id/players/:playerId',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            // ==========================
            // ORGANIZER ONLY
            // ==========================

            if (req.user.role !== 'Organizer') {

                return res.status(403).json({
                    message:
                        'Only organizers can remove players'
                })

            }


            // ==========================
            // FIND SESSION
            // ==========================

            const session =
                await QueueSession.findById(
                    req.params.id
                )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Queue session not found'
                })

            }


            // ==========================
            // CHECK OWNERSHIP
            // ==========================

            if (
                session.organizer.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        'You are not the organizer of this session'
                })

            }


            const playerId =
                req.params.playerId


            // ==========================
            // CHECK IF PLAYER EXISTS
            // IN ACTIVE SESSION
            // ==========================

            const isActivePlayer =
                session.activePlayers.some(
                    id =>
                        id.toString() ===
                        playerId
                )


            const isWaiting =
                session.waitingPlayers.some(
                    id =>
                        id.toString() ===
                        playerId
                )


            if (
                !isActivePlayer &&
                !isWaiting
            ) {

                return res.status(404).json({
                    message:
                        'Player is not in this Quick Play session'
                })

            }


            // ==========================
            // PREVENT REMOVAL WHILE
            // CURRENTLY PLAYING
            // ==========================

            const activeMatch =
                await QueueMatch.findOne({

                    queueSession:
                        session._id,

                    status:
                        'Playing',

                    players:
                        playerId

                })


            if (activeMatch) {

                return res.status(400).json({

                    message:
                        `This player is currently playing on Court ${activeMatch.courtNumber}. Finish the match before removing them.`

                })

            }


            // ==========================
            // REMOVE FROM WAITING QUEUE
            // ==========================

            session.waitingPlayers =
                session.waitingPlayers.filter(
                    id =>
                        id.toString() !==
                        playerId
                )


            // ==========================
            // REMOVE FROM ACTIVE PLAYERS
            // ==========================

            session.activePlayers =
                session.activePlayers.filter(
                    id =>
                        id.toString() !==
                        playerId
                )


            /*
                DO NOT REMOVE FROM:

                session.participants

                participants is kept for
                historical records and stats.
            */


            await session.save()


            // ==========================
            // REAL-TIME UPDATE
            // ==========================

            emitQueueUpdate(
                req,
                session._id
            )


            return res.json({

                message:
                    'Player removed from Quick Play successfully'

            })


        } catch (err) {

            console.error(
                'REMOVE QUICK PLAY PLAYER ERROR:',
                err
            )


            return res.status(500).json({

                message:
                    'Failed to remove player'

            })

        }

    }
)

// ==========================
// SKIP PLAYER ONCE
// ORGANIZER ONLY
// ==========================

router.put(
    '/:id/players/:playerId/skip',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            // ==========================
            // ORGANIZER ONLY
            // ==========================

            if (req.user.role !== 'Organizer') {

                return res.status(403).json({
                    message:
                        'Only organizers can skip players'
                })

            }


            // ==========================
            // FIND SESSION
            // ==========================

            const session =
                await QueueSession.findById(
                    req.params.id
                )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Queue session not found'
                })

            }


            // ==========================
            // CHECK OWNERSHIP
            // ==========================

            if (
                session.organizer.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        'You are not the organizer of this session'
                })

            }


            // ==========================
            // SESSION MUST BE OPEN
            // ==========================

            if (session.status !== 'Open') {

                return res.status(400).json({
                    message:
                        'Players can only be skipped while the session is open'
                })

            }


            const playerId =
                req.params.playerId


            // ==========================
            // FIND PLAYER IN QUEUE
            // ==========================

            const playerIndex =
                session.waitingPlayers.findIndex(
                    id =>
                        id.toString() ===
                        playerId
                )


            if (playerIndex === -1) {

                return res.status(404).json({
                    message:
                        'Player is not currently waiting'
                })

            }


            // ==========================
            // ALREADY LAST
            // ==========================

            if (
                playerIndex ===
                session.waitingPlayers.length - 1
            ) {

                return res.status(400).json({
                    message:
                        'Player is already at the end of the queue'
                })

            }


            // ==========================
            // MOVE TO END
            // ==========================

            const [player] =
                session.waitingPlayers.splice(
                    playerIndex,
                    1
                )


            session.waitingPlayers.push(
                player
            )


            await session.save()


            // ==========================
            // REAL-TIME UPDATE
            // ==========================

            emitQueueUpdate(
                req,
                session._id
            )


            return res.json({

                message:
                    'Player skipped and moved to the end of the queue'

            })


        } catch (err) {

            console.error(
                'SKIP QUICK PLAY PLAYER ERROR:',
                err
            )


            return res.status(500).json({

                message:
                    'Failed to skip player'

            })

        }

    }
)

// ==========================
// REORDER WAITING QUEUE
// ORGANIZER ONLY
// ==========================

router.put(
    '/:id/reorder',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            // ==========================
            // ORGANIZER ONLY
            // ==========================

            if (req.user.role !== 'Organizer') {

                return res.status(403).json({
                    message:
                        'Only organizers can change the queue order'
                })

            }


            // ==========================
            // FIND SESSION
            // ==========================

            const session =
                await QueueSession.findById(
                    req.params.id
                )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Queue session not found'
                })

            }


            // ==========================
            // CHECK OWNERSHIP
            // ==========================

            if (
                session.organizer.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        'You are not the organizer of this session'
                })

            }


            // ==========================
            // SESSION MUST BE OPEN
            // ==========================

            if (session.status !== 'Open') {

                return res.status(400).json({
                    message:
                        'Queue order can only be changed while the session is open'
                })

            }


            const {
                playerIds
            } = req.body


            if (!Array.isArray(playerIds)) {

                return res.status(400).json({
                    message:
                        'Invalid queue order'
                })

            }


            // ==========================
            // CURRENT WAITING PLAYERS
            // ==========================

            const currentIds =
                session.waitingPlayers.map(
                    playerId =>
                        playerId.toString()
                )


            // Must contain the same
            // number of players

            if (
                playerIds.length !==
                currentIds.length
            ) {

                return res.status(400).json({
                    message:
                        'Queue order does not match the current waiting queue'
                })

            }


            // ==========================
            // PREVENT DUPLICATES
            // ==========================

            const uniqueIds =
                new Set(playerIds)


            if (
                uniqueIds.size !==
                playerIds.length
            ) {

                return res.status(400).json({
                    message:
                        'Queue order contains duplicate players'
                })

            }


            // ==========================
            // MAKE SURE ALL PLAYERS
            // ARE CURRENTLY WAITING
            // ==========================

            const validOrder =
                playerIds.every(
                    playerId =>
                        currentIds.includes(
                            playerId
                        )
                )


            if (!validOrder) {

                return res.status(400).json({
                    message:
                        'Queue order contains an invalid player'
                })

            }


            // ==========================
            // PRESERVE OBJECT IDS
            // ==========================

            const playerMap =
                new Map(
                    session.waitingPlayers.map(
                        playerId => [
                            playerId.toString(),
                            playerId
                        ]
                    )
                )


            session.waitingPlayers =
                playerIds.map(
                    playerId =>
                        playerMap.get(playerId)
                )


            session.markModified(
                'waitingPlayers'
            )


            await session.save()


            // ==========================
            // REAL-TIME UPDATE
            // ==========================

            emitQueueUpdate(
                req,
                session._id
            )


            return res.json({
                message:
                    'Queue order updated successfully'
            })


        } catch (err) {

            console.error(
                'REORDER QUEUE ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to update queue order'
            })

        }

    }
)

// ==========================
// MOVE PLAYER IN QUEUE
// ORGANIZER ONLY
// ==========================

router.put(
    '/:id/players/:playerId/move',
    authMiddleware,
    restrictionMiddleware,
    async (req, res) => {

        try {

            // ==========================
            // ORGANIZER ONLY
            // ==========================

            if (req.user.role !== 'Organizer') {

                return res.status(403).json({
                    message:
                        'Only organizers can change the queue order'
                })

            }


            // ==========================
            // FIND SESSION
            // ==========================

            const session =
                await QueueSession.findById(
                    req.params.id
                )


            if (!session) {

                return res.status(404).json({
                    message:
                        'Queue session not found'
                })

            }


            // ==========================
            // CHECK OWNERSHIP
            // ==========================

            if (
                session.organizer.toString() !==
                req.user.id
            ) {

                return res.status(403).json({
                    message:
                        'You are not the organizer of this session'
                })

            }


            // ==========================
            // SESSION MUST BE OPEN
            // ==========================

            if (session.status !== 'Open') {

                return res.status(400).json({
                    message:
                        'Queue order can only be changed while the session is open'
                })

            }


            const {
                direction
            } = req.body


            if (
                !['up', 'down']
                    .includes(direction)
            ) {

                return res.status(400).json({
                    message:
                        'Invalid move direction'
                })

            }


            const playerId =
                req.params.playerId


            // ==========================
            // FIND PLAYER POSITION
            // ==========================

            const currentIndex =
                session.waitingPlayers.findIndex(
                    id =>
                        id.toString() ===
                        playerId
                )


            if (currentIndex === -1) {

                return res.status(404).json({
                    message:
                        'Player is not currently waiting'
                })

            }


            // ==========================
            // MOVE UP
            // ==========================

            if (direction === 'up') {

                if (currentIndex === 0) {

                    return res.status(400).json({
                        message:
                            'Player is already first in the queue'
                    })

                }


                const previousPlayer =
                    session.waitingPlayers[
                        currentIndex - 1
                    ]


                session.waitingPlayers[
                    currentIndex - 1
                ] =
                    session.waitingPlayers[
                        currentIndex
                    ]


                session.waitingPlayers[
                    currentIndex
                ] =
                    previousPlayer

            }


            // ==========================
            // MOVE DOWN
            // ==========================

            if (direction === 'down') {

                if (
                    currentIndex ===
                    session.waitingPlayers.length - 1
                ) {

                    return res.status(400).json({
                        message:
                            'Player is already last in the queue'
                    })

                }


                const nextPlayer =
                    session.waitingPlayers[
                        currentIndex + 1
                    ]


                session.waitingPlayers[
                    currentIndex + 1
                ] =
                    session.waitingPlayers[
                        currentIndex
                    ]


                session.waitingPlayers[
                    currentIndex
                ] =
                    nextPlayer

            }


            // ==========================
            // TELL MONGOOSE ARRAY CHANGED
            // ==========================

            session.markModified(
                'waitingPlayers'
            )


            await session.save()


            // ==========================
            // REAL-TIME UPDATE
            // ==========================

            emitQueueUpdate(
                req,
                session._id
            )


            return res.json({

                message:
                    direction === 'up'
                        ? 'Player moved up in the queue'
                        : 'Player moved down in the queue'

            })


        } catch (err) {

            console.error(
                'MOVE QUEUE PLAYER ERROR:',
                err
            )


            return res.status(500).json({
                message:
                    'Failed to update queue order'
            })

        }

    }
)

module.exports = router