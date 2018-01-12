const schema = {
  definitions: {
    data: {
      oneOf: [
        { $ref: 'entity.json' },
        {
          type: 'array',
          items: {
            $ref: 'entity.json'
          },
          uniqueItems: true
        }
      ]
    },
    update: {
      $ref: 'entity.json'
    }
  }
}
