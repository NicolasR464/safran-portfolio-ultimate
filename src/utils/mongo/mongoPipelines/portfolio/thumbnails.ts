export const thumbnailsPipeline = (batch: number, batchSize: number) => [
    {
        $lookup: {
            from: 'projectCategories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
        },
    },
    {
        $unwind: '$category',
    },
    {
        $project: {
            _id: 1,
            title: 1,
            category: {
                _id: '$category._id',
                name: '$category.name',
                order: '$category.order',
            },
            order: 1,
            imageUrl: {
                $let: {
                    vars: {
                        thumbnail: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: '$images',
                                        as: 'img',
                                        cond: {
                                            $in: ['thumbnail', '$$img.types'],
                                        },
                                    },
                                },
                                0,
                            ],
                        },
                    },
                    in: '$$thumbnail.url',
                },
            },
        },
    },
    {
        $sort: {
            'category.order': 1,
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
            _id: {
                _id: '$category._id',
                name: '$category.name',
                order: '$category.order',
            },
            items: { $push: '$$ROOT' },
        },
    },
    {
        $sort: {
            '_id.order': 1,
            '_id.name': 1,
        },
    },
    {
        $project: {
            _id: 0,
            category: {
                _id: '$_id._id',
                name: '$_id.name',
                order: '$_id.order',
            },
            items: 1,
        },
    },
]
