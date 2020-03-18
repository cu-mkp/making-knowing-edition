import React from 'react';
import Typography from '@material-ui/core/Typography'
import CustomizedTooltops from './CustomizedTooltops'

const AnnotationByLine = ({ annoAuthors, authors }) => {
    let authorInfos = []
    for (let authorID of annoAuthors) {
        authorInfos.push(authors[authorID])
    }
    let lastID = authorInfos.length > 0 ? authorInfos[authorInfos.length - 1].id : null
    let authorInfoDivs = []
    for (let author of authorInfos) {
        const frag = (
            <div>
                <Typography><b>{author.fullName}</b></Typography>
                <Typography>{author.semester} {author.year}</Typography>
                <Typography>{author.authorType}</Typography>
                <Typography>{author.degree} {author.yearAtTime}</Typography>
                <Typography>{author.department} {author.subField}</Typography>
            </div>
        )

        authorInfoDivs.push(
            <CustomizedTooltops key={author.id}
                htmlFragment={frag}
                inner={<span>{author.fullName}{(author.id !== lastID) ? ', ' : ''}</span>}
            >
            </CustomizedTooltops>
        )
    }
    return authorInfoDivs

};

export default AnnotationByLine;