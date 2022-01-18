declare module 'svg-baker/lib/symbol-factory' {
  function symbolFactory(options: { id?: string; content: string }): {
    tree: {
      attrs: {
        id: string
        viewBox: string
      }
    }[]
  }
  export default symbolFactory
}
