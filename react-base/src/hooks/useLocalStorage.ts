import React, { useState, useEffect } from 'react'

/**
 * Custom Hook para gerenciar estado com localStorage
 * @param {string} key - Chave do localStorage
 * @param {any} initialValue - Valor inicial se não existir no localStorage
 * @returns {[any, Function]} - [valor, setValor]
 */
export const useLocalStorage = <T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  // Estado inicializado com valor do localStorage ou initialValue
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Salva no localStorage sempre que o valor mudar
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Erro ao salvar localStorage key "${key}":`, error)
    }
  }, [key, value])

  return [value, setValue]
}
