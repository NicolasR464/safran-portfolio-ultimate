export const thumbnailsPipeline = (batch: number, batchSize: number) => [
    {
        $match: {
            category: { $ne: 'home' },
        },
    },

    {
        $project: {
            _id: 1,
            title: 1,
            category: 1,
            order: 1,
            imageUrl: '$image.url',
        },
    },

    {
        $sort: {
            category: 1,
            order: 1,
            _id: 1, // important for stable pagination
        },
    },

    {
        $skip: (batch - 1) * batchSize,
    },

    {
        $limit: batchSize,
    },

    {
        $group: {
            _id: '$category',
            items: { $push: '$$ROOT' },
        },
    },

    {
        $project: {
            _id: 0,
            category: '$_id',
            items: 1,
        },
    },
]
