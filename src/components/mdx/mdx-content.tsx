'use client'

import * as runtime from 'react/jsx-runtime'
import Image from 'next/image'

const useMDXComponent = (code: string) => {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

const components = {
  Image,
}

export function MDXContent({ code }: { code: string }) {
  const Component = useMDXComponent(code)
  return <Component components={components} />
}
