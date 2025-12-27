import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
export default function Credit() {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <span className="text-foreground text-sm">Monthly Credits</span>
        <span className="text-secondary">8/10</span>
      </CardHeader>
      <CardContent>
        <Progress value={80} />
      </CardContent>
      <CardFooter>
        <Button className="bg-secondary text-secondary-foreground w-full font-semibold">
          Upgrade Plan
        </Button>
      </CardFooter>
    </Card>
  )
}
