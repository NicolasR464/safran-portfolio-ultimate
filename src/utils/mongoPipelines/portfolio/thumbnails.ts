export const thumbnailsPipeline = (batch: number, batchSize: number) => [
    {
        $facet: {
            thumbnails: [
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
                        _id: 1,
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
            ],

            categories: [
                {
                    $group: {
                        _id: '$category',
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
                {
                    $group: {
                        _id: null,
                        categories: { $push: '$_id' },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        categories: 1,
                    },
                },
            ],
        },
    },
    {
        $project: {
            thumbnails: 1,
            categories: {
                $ifNull: [{ $arrayElemAt: ['$categories.categories', 0] }, []],
            },
        },
    },
]
