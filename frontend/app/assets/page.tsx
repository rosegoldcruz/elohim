import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"

const assets = [
  {
    id: 1,
    name: "Martian_Sunset_Final.mp4",
    type: "Final Video",
    format: "MP4",
    size: "128 MB",
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=64&width=64",
  },
  {
    id: 2,
    name: "Martian_Sunset_Thumbnail.png",
    type: "Thumbnail",
    format: "PNG",
    size: "2.1 MB",
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=64&width=64",
  },
  {
    id: 3,
    name: "Scene_01_Mars_Rover.mp4",
    type: "Scene Clip",
    format: "MP4",
    size: "8.5 MB",
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=64&width=64",
  },
  {
    id: 4,
    name: "Scene_02_Astronaut.mp4",
    type: "Scene Clip",
    format: "MP4",
    size: "7.9 MB",
    url: "#",
    thumbnailUrl: "/placeholder.svg?height=64&width=64",
  },
]

export default function AssetsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Asset Manager</h1>
      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Project: Martian Sunset</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800">
                <TableHead>Preview</TableHead>
                <TableHead>Asset Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id} className="border-neutral-800">
                  <TableCell>
                    <img
                      src={asset.thumbnailUrl || "/placeholder.svg"}
                      alt={asset.name}
                      className="w-12 h-12 rounded-md object-cover bg-neutral-700"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell className="text-neutral-400">{asset.type}</TableCell>
                  <TableCell className="text-neutral-400">{asset.format}</TableCell>
                  <TableCell className="text-neutral-400">{asset.size}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-900/50">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
