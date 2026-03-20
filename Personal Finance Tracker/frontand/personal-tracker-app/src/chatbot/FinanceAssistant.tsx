import { MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import { Chatbot } from 'react-chatbot-kit'
import 'react-chatbot-kit/build/main.css'
import ActionProvider from './ActionProvider'
import config from './config'
import MessageParser from './MessageParser'

function FinanceAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="chatbot-shell">
      <div className={isOpen ? 'chatbot-panel chatbot-panel-open' : 'chatbot-panel'}>
        <Chatbot config={config} actionProvider={ActionProvider} messageParser={MessageParser} />
      </div>

      <button
        type="button"
        className="chatbot-launcher"
        aria-label={isOpen ? 'Close help assistant' : 'Open help assistant'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  )
}

export default FinanceAssistant
