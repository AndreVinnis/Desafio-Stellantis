import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function RouteError() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <Alert variant="destructive">
        <AlertTitle>{notFound ? 'Página não encontrada' : 'Algo deu errado'}</AlertTitle>
        <AlertDescription>
          {notFound
            ? 'O endereço acessado não existe.'
            : 'Ocorreu um erro inesperado ao exibir esta página. Tente novamente.'}
        </AlertDescription>
      </Alert>
      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>Recarregar</Button>
        <Button variant="outline" render={<Link to="/" />} nativeButton={false}>
          Ir para o início
        </Button>
      </div>
    </div>
  )
}
