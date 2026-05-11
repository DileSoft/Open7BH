import React, { useState } from 'react';
import { Box, IconButton, Popover } from '@mui/material';
import { directionIcon } from './Utils';
import { Direction, DirectionWithHere } from './Classes/Operators/OperatorStep';

interface DirectionGridProps {
    value: (Direction | DirectionWithHere)[] | Direction | DirectionWithHere;
    onChange: (dir: (Direction | DirectionWithHere)[] | Direction | DirectionWithHere) => void;
    multiple?: boolean;
    withHere?: boolean;
}

export const DirectionGrid = ({ value, onChange, multiple = false, withHere = false }: DirectionGridProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const directions: (Direction | DirectionWithHere | null)[][] = [
        [Direction.UpLeft, Direction.Up, Direction.UpRight],
        [Direction.Left, withHere ? DirectionWithHere.Here : null, Direction.Right],
        [Direction.DownLeft, Direction.Down, Direction.DownRight],
    ];

    const values = Array.isArray(value) ? value : (value ? [value] : []);

    const toggleDirection = (dir: Direction | DirectionWithHere) => {
        if (multiple) {
            if (values.includes(dir)) {
                onChange(values.filter(d => d !== dir));
            } else {
                onChange([...values, dir]);
            }
        } else {
            onChange(dir);
            if (!multiple) setAnchorEl(null);
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton
                size="small"
                onMouseDown={handleClick}
                sx={{ 
                    border: '1px solid #ccc', 
                    borderRadius: 1, 
                    p: 0.5, 
                    width: 32, 
                    height: 32,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '2px',
                    width: '18px',
                    height: '18px'
                }}>
                    {directions.flat().map((dir, i) => (
                        <Box 
                            key={i} 
                            sx={{ 
                                width: '4px', 
                                height: '4px', 
                                borderRadius: '1px',
                                backgroundColor: dir && values.includes(dir) 
                                    ? 'primary.main' 
                                    : (dir ? '#eee' : 'transparent'),
                                visibility: dir ? 'visible' : 'hidden'
                            }} 
                        />
                    ))}
                </Box>
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                onMouseDown={(e) => e.stopPropagation()}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box 
                    sx={{ p: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}
                >
                    {directions.flat().map((dir, i) => (
                        <Box key={i} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {dir ? (
                                <IconButton
                                    size="small"
                                    color={values.includes(dir) ? 'primary' : 'default'}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleDirection(dir);
                                    }}
                                    sx={{
                                        border: values.includes(dir) ? '1px solid' : 'none',
                                        borderRadius: 1,
                                        p: 0.5,
                                        minWidth: 0,
                                        ...(dir === DirectionWithHere.Here && {
                                            backgroundColor: values.includes(dir) ? 'primary.main' : '#ccc',
                                            width: 24,
                                            height: 24,
                                            '&:hover': {
                                                backgroundColor: values.includes(dir) ? 'primary.dark' : '#bbb',
                                            }
                                        })
                                    }}
                                >
                                    {directionIcon(dir)}
                                </IconButton>
                            ) : null}
                        </Box>
                    ))}
                </Box>
            </Popover>
        </>
    );
};
